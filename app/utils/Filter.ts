export class Filter {
    /** 
     * id to be used in HTML
     * Example 1: \<input id="ID"\>
     * Example 2: \<label for="ID"\> 
     **/
    id: string;

    /**
     * Text that will be diplayed above the input
     */
    searchLabel: string;

    private _value?: string;
    get value(): any {
        return this._value;
    }
    set value(param: any) {
        this._value = param;
    }

    /**
     * (Optional) Name of the queryParameter related to the input
     */
    queryParam?: string;

    /**
     * (Optional) Name of the queryParameters related to the input. Currently only used in DateRangeFilter
     */
    queryParams?: Array<string>;


    /**
     * Return a filter object for use in Ember's store.query("model", {filter: FILTER})
     * The generated object will be combined with any other filters and parsed to the (JSON:API) request
     * 
     * 
     * @example
     *  filter: (value: string) => {
     *      return {
     *          ":or:": {
     *              title: value,
     *              description: value
     *          }
     *      }
     * 
     * 
     * @example
     *  filter: (value: string) => {
     *      "session": {
     *          "governing-body": {
     *              "administrative-unit": {
     *                  "name": value
     *              }
     *          }
     *       }
     *   }
     * 
     * 
     * 
     * 
     * 
     * 
     * @param value The function should take one value, which will be used in the request 
     * @returns A JavaScript object for use in Ember/JSON:API queries
     */
    filter: (value: any) => { [key:string]: any };



    /**
     * Because Ember templates have limited conditionals,
     * searcher.hbs uses these variables to determine what type they are
     */
    Text?: boolean = false;
    Select?: boolean = false;
    DateRange?: boolean = false;
    

    constructor(id: string, searchLabel: string, filter: (value: string) => { [key:string]: any }, queryParam?: string|undefined) {
        this.id = id;
        this.searchLabel = searchLabel;
        this.filter = filter;
        if (queryParam) {
            this.queryParam = queryParam;
        }
    }

};

export class TextFilter extends Filter {
    Text = true;

    placeholder?: string;


    constructor(
        id: string, 
        searchLabel: string, 
        filter: (value: string) => { [key:string]: any }, 
        value: string = "", 
        placeholder: string|undefined = undefined,
        queryParam?: string) 
        {
            super(id, searchLabel, filter, queryParam);
            this.value = value;

            if (placeholder) {
                this.placeholder = placeholder;
            }
        }

    


}

export class SelectFilter extends Filter {
    Select = true

    options: any;
    selected: any;
    placeholder?: string;


    constructor(
        id: string, 
        searchLabel: string, 
        filter: (value: string) => { [key:string]: any },
        options: any, 
        selected: any|undefined,
        placeholder?: string,
        queryParam?: string) 
        {
            super(id, searchLabel, filter, queryParam);
            this.options = options;
            if (selected) {
                this.selected = selected
            }
            if (placeholder) {
                this.placeholder = placeholder;
            }
        }

    
    override get value() {
        return this.selected;
    }
    override set value(value: any) {
        this.selected = value;
    }
}

export class DateRangeFilter extends Filter {
    DateRange = true;

    start?: string;
    end?: string;

    constructor(
        id: string, 
        searchLabel: string, 
        filter: (start: string) => { [key:string]: any },
        start?: string,
        end?: string,
        queryParams?: Array<string>) 
        {
            super(id, searchLabel, filter);

            if (start) {
                this.start = start;
            }
            if (end) {
                this.end = end;
            }
            if (queryParams) {
                this.queryParams = queryParams;
            }
        }
   
    override get value() {
        return `${this.start}<->${this.end}`
    }
    override set value(value: string){
        if (!this.start) {
            this.start = value;
        }
        else if (!this.end) {
            this.end = value;
        } else {
            this.start = undefined;
            this.end = undefined;
            this.value = value;
        }
    }
}

