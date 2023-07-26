import Service from '@ember/service';

export type PageMetadata = { number?: number; size?: number };
export type Page = {
  first?: PageMetadata;
  last?: PageMetadata;
  prev?: PageMetadata;
  next?: PageMetadata;
  self?: PageMetadata;
};

export type MuSearchData = { [key: string]: [key: string] };
export type DataMapper<T> = (data: MuSearchData) => T;
export type PageableRequest<T> = {
  index?: string;
  page: number;
  size: number;
  sort?: string;
  filters: { [key: string]: string };
  dataMapping?: DataMapper<T>;
};

export interface MuSearchResponse<T> {
  count: number;
  pagination: Page;
  items: T[];
}

export default class MuSearchService extends Service {
  sortOrder(sort: string): string | null {
    if (sort.startsWith('-')) {
      return 'desc';
    }
    if (sort.length > 0) {
      return 'asc';
    }
    return null;
  }
  stripSort(sort: string): string {
    return sort.replace(/(^\+)|(^-)/g, '');
  }

  getPaginationMetadata(pageNumber: number, size: number, total: number): Page {
    const pagination = {} as Page;

    pagination.first = {
      number: 0,
      size,
    };

    const lastPageNumber =
      total % size === 0
        ? Math.floor(total / size) - 1
        : Math.floor(total / size);
    const lastPageSize = total % size === 0 ? size : total % size;
    pagination.last = {
      number: lastPageNumber,
      size: lastPageSize,
    };

    pagination.self = {
      number: pageNumber,
      size,
    };

    if (pageNumber > 0) {
      pagination.prev = {
        number: pageNumber - 1,
        size,
      };
    }

    if (pageNumber < lastPageNumber) {
      const nextPageSize =
        pageNumber + 1 === lastPageNumber ? lastPageSize : size;
      pagination.next = {
        number: pageNumber + 1,
        size: nextPageSize,
      };
    }

    return pagination;
  }

  async search<T>(request: PageableRequest<T>): Promise<MuSearchResponse<T>> {
    const { index, page, size, sort, filters, dataMapping } = request;
    const params = [];
    params.push(`page[size]=${size}`);
    params.push(`page[number]=${page}`);

    for (const field in filters) {
      const q = filters[field];
      const f = field;
      params.push(`filter[${f}]=${q}`);
    }

    if (sort) {
      const sortParams = sort.split(',');
      sortParams.forEach((sortParam) => {
        params.push(
          `sort[${this.stripSort(sortParam)}.field]=${this.sortOrder(
            sortParam
          )}`
        );
      });
    }

    const endpoint = `/search/${index}/search?${params.join('&')}`;
    const { count, data } = await (await fetch(endpoint)).json();
    const pagination = this.getPaginationMetadata(page, size, count);
    const entries = data.map(dataMapping);

    return {
      items: entries,
      count,
      pagination,
    };
  }
}
