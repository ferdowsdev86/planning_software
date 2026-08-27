# Using a Store

This guide shows how to manage records in a `Store`, for example how to retrieve records and how to sort or filter the
store.

## Store example

The store outlined in code below is referred to in the examples ahead in this guide:

```javascript
const store = new Store({
    data : [
        { id : 1, name : 'Ms. Marvel', powers : 'Shapeshifting' },
        { id : 2, name : 'Black Widow', powers : 'Martial arts' },
        { id : 3, name : 'Captain Marvel', powers : 'Energy projection' },
        { id : 4, name : 'X-23', powers : 'Regeneration' },
        { id : 5, name : 'Mockingbird', powers : 'Martial arts' }
    ]
});
```

A store is a collection of [Model](#Core/data/Model) instances, each known as a record, akin to a row in a Grid.
The Model outlines the data structure, specifying the fields included in each record.

### Auto-generated Model

If you do not specify any model, one will be created for you. The properties of the first record in your data will be
turned into fields:

```javascript
const store = new Store({
    data : [
        { name : 'Wolverine', powers : 'Regeneration' },
        { name : 'Deadpool', powers : 'Yes I have, great powers' }   
    ]
});
```

The code above will create a store with two records, based on a generated Model containing the two fields `name` and
`powers`.

<div class="note">
Note that this approach is risky, if your backend for example uses a JSON serializer that optimizes
away null values, or your rows have varying fields, the model might end up with an incorrect set of fields. For all but
the very basic scenarios we recommend using a <strong>Custom data model</strong> (see below)

</div>

## Custom data model

If you need more control over the fields a model contains, you have two options. If you do not need to reuse the Model, 
you can simply specify the fields when creating the store:

```javascript
const store = new Store({
    fields : ['name', 'powers', 'affiliation'],
    data : [
        { name : 'Wolverine', powers : 'Regeneration' },
        /*...*/
    ]
});
```

You can also create a subclass of `Model` and define the fields you need on it:

```javascript
class SuperHero extends Model {
    static fields = [
        'name', // this works too (name='Wolverine')
        { name : 'powers', defaultValue: 'String' }, // With default value
        { name : 'birthday', type : 'date', format : 'YYYY-MM-DD' }, // a date field
        { name : 'affiliation', readOnly : true } // Not editable
        ]
}

const store = new Store({
    modelClass : SuperHero,
    data: [
        { name : 'Wolverine', powers : 'Regeneration' },
        /*...*/
    ]
}); 
```

See the API docs for [Model](#Core/data/Model) for more information on defining and mapping fields.

<div class="note">
When using a store, it is advisable to define your own custom model class or  
<a href="#Chart/guides/data/displayingdata.md#using-inline-data">inline fields</a>
 .

</div>

## Retrieving records

A `Store` can be seen as a collection of records with functionality to manage them. To retrieve a record, it is easiest
to do it using its index or id:

```javascript
store.getAt(1); // Black Widow
store.getById(3); // Captain Marvel
```

There are also shortcuts to get the first or last record:

```javascript
store.first; // Ms. Marvel
store.last; // Mockingbird
```

You can search for a single record:

```javascript
store.find(record => record.name.startsWith('M')); // Ms. Marvel
store.findRecord('name', 'X-23'); // X-23, surprise
```

Or query for multiple:

```javascript
store.query(record => record.name.startsWith('M')); // [Ms. Marvel, Mockingbird]
```

## Counting the records in the Store

The Store can contain both "data" records, as well as UI-related records when used with a data grid (such as group 
header, and footer rows etc.). Depending on your application logic, you might be interested in different 
ways of counting (visible rows only, with or without filtered out results, etc.). The
[getCount](#Core/data/Store#function-getCount) lets you decide how to count the records.

```javascript
// "Visible" records (as would be shonw in a Grid etc.), i.e. after filtering, including group 
// headers, excluding records in collapsed groups
const visibleRecords = store.count;

// Total records in the store, including records in collapsed groups and filtered out records, 
// excluding group headers (see the docs for getCount() for all options)
const allDataRecords = store.getCount({ collapsed : true, filteredOut : true }); 

// Include records that have been filtered out, 
// as well as any records inside collapsed groups or tree nodes.
const records = store.getCount({
    collapsed   : true,
    filteredOut : true
});

// All records, including group headers and filtered out records
const allRecords = store.getCount({
    all : true
});

// Including group headers + summary records
const records = store.getCount({
    headersFooters : true
});
```

## Sorting

A `Store` can be sorted by a single field or by multiple fields. Sort can be specified at creation time using stores
config:

```javascript
const store = new Store({
    sorters : [
        { field : 'powers' }, // ascending
        { field : 'name', ascending : false } // descending
    ]
});
```

After creation it can be sorted as below:

```javascript
store.sort('name'); // Sort by name, ascending, toggles on additional calls
store.sort('name', false); // Sort by name, descending

store.addSorter('powers'); // Also sort by powers
store.removeSorter('powers'); // Stop sorting by powers
```

## Filtering

Filtering makes the store expose a subset of its records. When iterating or querying the store only this subset will be
used. Examples on filtering:

```javascript
store.filter('powers', 'Martial arts'); // Black Widow, Mockingbird

store.filter({
    property  : 'id',
    operatior : '<',
    value     : 4
}); // Ms. Marvel, Black Widow, Captain Marvel

store.clearFilters(); // Remove filters
```

## Iterating over records

The records in the store can be iterated over in a couple of ways. Using for-of:

```javascript
for (let record of store) {
    console.log(record.name);
}
```

Or by using forEach:

```javascript
store.forEach(record => {
    console.log(record.name);
});
```

The stores implementation of `forEach` differs from the native arrays by allowing you to terminate the iteration by
returning false.

## Reactivity

Fields are turned into setters on the records, which makes them reactive. For example:

<div class="docs-tabs" data-name="framework">
<div>
    <a>JS</a>
    <a>React</a>
    <a>Vue</a>
    <a>Angular</a>
</div>
<div>

```javascript
const grid = new Grid({
    data : [
        { name : 'Wolverine', powers : 'Regeneration' },
        { name : 'Deadpool', powers : 'Yes I have, great powers' }   
    ]
});

grid.store.first.name = 'Logan';
```

</div>
<div>

```javascript
// Grid data: [{ name : 'Wolverine', powers : 'Regeneration' }]
grid.gridInstance.store.first.name = 'Logan';
```

</div>
<div>

```javascript
// Grid data: [{ name : 'Wolverine', powers : 'Regeneration' }]
grid.gridInstance.store.first.name = 'Logan';
```

</div>
<div>

```javascript
// Grid data: [{ name : 'Wolverine', powers : 'Regeneration' }]
grid.gridInstance.store.first.name = 'Logan';
```
</div>
</div>

This will update the grid on the fly to update and display `Logan` instead of `Wolverine`.

## CRUD operations

### Adding records

You can easily add existing records or raw data:

```javascript
store.add({ name : 'Scarlet Witch' });

// or

store.add(new Model({
    name   : 'Storm',
    powers : 'Weather'
}));
```

Same goes for insertion:

```javascript
store.insert(0, { name : 'She-Hulk' });

// or

store.insert(0, new Model({
    name   : 'Medusa',
    powers : 'Hair'
}));
```

### Removing records

Either retrieve a record and call `Model#remove()` or remove it using its id:

```javascript
store.remove(1); // Removes Ms. Marvel

store.last.remove(); // Removes Mockingbird
```

### Modifying records

Fields in a record are turned into setters which can be assigned to update the record, making it reactive. Doing so
triggers events that updates the grid (if the store is used with a grid). To modify a record, simply retrieve it and set
values:

```javascript
store.last.name = 'Jennifer Walters';
```

To set multiple fields in a single go:

```javascript
store.last.set({
    name   : 'Jennifer Walters',
    powers : 'Strength'
});
```

## JSON

If you want to serialize the contents of a store, you can access the data from all of its records in JSON format:

```javascript
 const jsonString = store.json;

// or

const jsonArray = store.toJSON();
```

To plug the JSON data back in later:

```javascript
 store.json = jsonString;
```

or

```javascript
 store.data = jsonString;
```


<p class="last-modified">Last modified on 2026-07-22 10:46:10</p>