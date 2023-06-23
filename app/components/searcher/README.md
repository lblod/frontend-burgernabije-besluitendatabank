# Searcher

This is the searcher component, a component to create an AppUniverse Ember-Data Searchbar with minimal configuration.

Searcher handles all of the following for you, no matter where you put it:
- Setting QueryParameters in any route
- Loading QueryParameter data into itself
- Getting data from any model
- Generating & applying query filters
- Infinity scroll

## Tutorials
This tutorial assumes you've already correctly created your Ember-Data models in app/models. BNB's `agenda-item` model will be used as an example. 

### Step 1: Adding the Searcher
In a template of your choosing, add the following:
```hbs
<Searcher
    @queryModel="agenda-item"
/>
```
That's it! Filters aren't configured yet, but all the data from your model will already be displayed.


### Step 2: Adding filters
To add a filter, all we have to do is create an object based on `IFilterInfo`.
Open your templates' route, and add the following code:

```ts
model(params: object, transition: Transition<unknown>) {
    const keywordFilter: IFilterInfo = {
        id: "keyword",
        searchLabel: "Trefwoord",
        placeholder: "Terrasvergunning",
        queryParam: "trefwoord"
        filterObject: (value: string) => {
            return {
                "title": value
            }
        }
    }

    return [keywordFilter];
}
```

And afterwards, pass these filters in your template like so:
```hbs
<Searcher
    @queryModel="agenda-item"
    @filters={{@model}}
/>
```

And that's it! You've now got a view of `agenda-item` with a filter.

#### filterObject
Most of these keys are self explanatory and/or have documentation in `IFilterInfo`. However, filterObject is a bit more obscure, so I will explain it a bit here!

So, [Ember-Data uses a filter object](https://guides.emberjs.com/release/models/finding-records/). The filterObject function has to - when passed a value - return an object that could be put in the Ember-Data query. That generated object only has to be for the filter in question; Searcher will combine that filter object with those of any other filters you have defined.





