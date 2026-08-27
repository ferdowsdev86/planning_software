# How to use Bryntum Grid with Django REST framework

[Bryntum Grid](https://bryntum.com/products/grid/) is a high-performance JavaScript table component that's feature-rich, 
easily customizable, and integrates with all major web frameworks. This tutorial will show you how to use Bryntum Grid 
with [Django REST framework](https://www.django-rest-framework.org/), a flexible toolkit for building web APIs in Django
projects. We'll build an application to display player information in a table.

We'll show you how to do the following:

- Set up a Django project that uses a SQLite database and configure the Django REST framework.
- Create a Django model to define the table structure in the database that will store sample player information.
- Create a custom Django REST framework endpoint to allow CRUD operations on the player information records.
- Connect a Bryntum Grid to retrieve data and synchronize updates via a custom API endpoint.

Here is what you will build.

![Bryntum Grid complete application](data/Grid/images/integration/django-restframework/complete-app.png)

## Prerequisites

To follow along, you will need to have [Python](https://www.python.org/downloads/) installed on your system.

## Getting started

We'll use an existing Django project as a starting point. Clone the 
[Django project starter GitHub repository](https://github.com/bryntum/bryntum-grid-django-restframework-starter). The
code for the completed tutorial is on the 
[`complete-app`](https://github.com/bryntum/bryntum-grid-django-restframework-starter/tree/complete-app) branch of the
repository.

The app has the following directory structure:

- `playerinfo`: The main Django project settings and configuration files.
- `static`: We'll add static resources to this directory, like stylesheets and JavaScript scripts.
- `templates`: The HTML page templates for the project.
- `manage.py`: The command-line utility used to manage Django projects.

This project has two main Python package dependencies, Django and Django REST framework. We will use a virtual
environment to install the dependencies. To create a virtual environment, run the following command in a terminal in the
root folder of the project:

```sh
python -m venv venv
```

Activate the virtual environment in your terminal with the following command:

```sh
source venv/bin/activate
```

Install the Django and Django REST framework dependencies with the following command:

```sh
pip install django djangorestframework
```

The starter project is already configured to use Django REST framework.

- In the `playerinfo/settings.py` file, the `INSTALLED_APPS` array includes a reference to the `rest_framework` app to
  make Django aware that we will use Django REST framework in the project.
- The default Django REST framework permissions are configured at the bottom of the `playerinfo/settings.py` file.

  ```python
  REST_FRAMEWORK = {
      'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.AllowAny',),
  }
  ```
- The default permissions are set to `permissions.AllowAny` so that the Bryntum Grid can make requests to the API we 
  build without requiring authentication.
- In the `playerinfo/settings.py` file, the path to the `static` folder is defined in the `STATICFILES_DIRS` array so 
  that Django can locate the static files we will use in this project.

  ```python
  STATICFILES_DIRS = [
      BASE_DIR / 'static'
  ]
  ```
- The `DIRS` config in the `TEMPLATES` array points to the `templates` folder so that Django can locate the HTML 
  templates we will use in the project.

  ```python
  TEMPLATES = [
      {
          ....

          'DIRS': [BASE_DIR / 'templates'],

          ....
      }
  ]
  ```

Start the project by running the following command in the root directory of the project:

```sh
python manage.py runserver localhost:8000
```

Visit `http://localhost:8000`, and you should see the initial Django project landing page.

## Create the static resources for the Bryntum Grid

To display player information data in the Bryntum Grid, we need the static resources from the Bryntum Grid distribution 
zip. The resources we need are:

- The JavaScript bundle for the Bryntum Grid
- CSS files
- Locales
- Fonts

These static resources are included in the distribution folder of the free trial version of Bryntum Grid, which you can 
download [here](https://bryntum.com/download/?product=grid). If you have already bought the licensed version of Bryntum 
Grid, you can log in [here](https://customerzone.bryntum.com/) to download the grid.

Copy the following files and folders from the `/build` folder in the Bryntum Grid distribution folder and paste them
into the `static/bryntum-grid` folder:

- `fonts`
- `locales`
- `grid.module.js`
- `grid.module.js.map`
- `grid.css`
- `grid.css.map`
- `svalbard-light.css`
- `svalbard-light.css.map`

## Modify the Bryntum Grid AjaxStore to synchronize data changes to the database

In the `static/bryntum-grid/grid.config.js` file, add the following properties to the AjaxStore `store` variable:

```javascript
  createUrl: "/player_info/",
  readUrl: "/player_info/",
  updateUrl: "/player_info/",
  deleteUrl: "/player_info/",
  autoLoad: true,
  autoCommit: true,
  useRestfulMethods: true,
  httpMethods: {
    read: "GET",
    create: "POST",
    update: "PATCH",
    delete: "DELETE",
  },
```

Here we set the create, read, update, and delete URLs and HTTP methods for the project.

We'll simplify creating API endpoints in the project by using Django REST framework 
[Viewsets](https://www.django-rest-framework.org/api-guide/viewsets/). For that, we need to modify the data sent to our 
custom API endpoint using the AjaxStore 
[`beforeRequest`](https://bryntum.com/products/grid/docs/api/Core/data/AjaxStore#event-beforeRequest) event. Add the 
following [listeners](https://bryntum.com/products/grid/docs/api/Core/data/AjaxStore#config-listeners) property to the 
AjaxStore configuration:

```javascript
  listeners: {
    beforeRequest: (event) => {
      if (event.action === "create") {
        const newItem = event.body.data[0];
        delete newItem.id;
        event.body = newItem;
      }
      if (event.action === "update") {
        const updatedItem = event.body.data[0];
        const itemId = updatedItem.id;
        delete updatedItem.id;
        event.body = updatedItem;
        store.updateUrl = `/player_info/${itemId}/`;
      }
    },
  },
```

When the AjaxStore sends a request, the `beforeRequest` event listener modifies the data sent in the `event.body` to 
match the data structure required by the custom API endpoint for create and update operations.

Note that we add the required `itemId` route parameter for the update operation by modifying the `store.updateUrl` 
property.

## Create the HTML page to display the Bryntum Grid

Now let's create the HTML page that will display the Bryntum Grid. In the `templates/index.html` file, add the following 
code:

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="{% static 'bryntum-grid/grid.css' %}"/>
    <link rel="stylesheet" type="text/css" href="{% static 'bryntum-grid/svalbard-light.css' %}"/>
    <style>
        body,
        html {
            margin: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
            font-size: 14px;
        }
    </style>
    <title>Player Information</title>
</head>
<body>
<script type="module" src="{% static 'bryntum-grid/grid.config.js' %}"></script>
</body>
</html>
```

Here we load the Bryntum Grid stylesheet and the configurations defined in the `grid.config.js` file. The 
`grid.config.js` file configures the Bryntum Grid to attach to the `body` HTML element. We also set the body element to 
take up the full height of the browser window in the style configuration.


## Set up the player information API endpoint

We'll create a new app in the Django project to set up the API endpoint for the Bryntum Grid to load information from. 
Run the following command from the root folder of the project:

```sh
python manage.py startapp api
```

This creates a new app called `api` in the project. 

To make Django aware of the new application, update the `INSTALLED_APPS` array in the `playerinfo/settings.py` file and 
add the new app's label to it:

```python
INSTALLED_APPS = [
    ...
    
    'api'
]
```

Replace the code in the `playerinfo/urls.py` file with the following code:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('api.urls'))
]
```

Here we set Django to include the URL patterns that we will define in the `api` app so that the routes will be reachable 
when the Bryntum Grid makes requests.


### Register an API router

Create a file `api/urls.py` and add the following code to it:

```python
from django.urls import path
from rest_framework import routers

from . import views

router = routers.DefaultRouter(trailing_slash=True)
router.register(r'player_info', views.PlayerViewSet)

urlpatterns = [
    path('', views.index, name='index'),
]

urlpatterns += router.urls
```

Here we define a router and register the viewset associated with the `player_info` route. We also define a path to the 
index page that displays the Bryntum Grid.


### Create the player model

Insert the following model in the `api/models.py` file:

```python
class Player(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    team = models.CharField(max_length=100)
    score = models.IntegerField(default=0)
    percentage_wins = models.IntegerField(default=0)
```

This model defines the structure of the table that will store our player information in the database.

### Create a player information serializer

Create a file `api/serializers.py` and add the following code to it:

```python
from rest_framework import serializers

from .models import Player


class PlayerSerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=True)
    city = serializers.CharField(required=False)
    team = serializers.CharField(required=False)
    score = serializers.IntegerField(required=False)
    percentage_wins = serializers.IntegerField(required=False)

    class Meta:
        model = Player
        fields = ('id', 'name', 'city', 'team', 'score', 'percentage_wins')
```

When data is updated on the Bryntum Grid, only the fields that have changed are passed as part of the call to the 
`player_info` API endpoint. In the serializer, we set `name` to `required` so that update requests without a `name` 
field will fail, and the serializer will raise an exception for the missing required field.

We need to override the serializer's update method to ensure that all the required fields are part of the validated 
data. To do this, we set the required fields to the value they already hold in the record instance. Define the `update`
function below in the `PlayerSerializer`.

```python
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if 'name' not in validated_data:
            validated_data['name'] = instance.name

        instance.save()
        return instance
```

This code makes sure the required `name` field is part of the validated data so that the serializer will not raise an 
exception for missing required fields.

### Create the player information viewset


In the `api/views.py` file, add the following imports:

```python
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action

from .models import Player
from .serializers import PlayerSerializer
```

Add the view that will be rendered when the index page of the app is visited:

```python
def index(request):
    return render(request, 'index.html')
```

In the `api/views.py` file, define the viewset that will be used to manage API requests:

```python
class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
```

To be sure the response from the `player_info` API endpoint is in the format the Bryntum Grid expects, we will override
the viewset's CRUD actions. First define the `create` action in the body of the `PlayerViewSet` class:

```python
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({'success': True, 'data': [serializer.data]}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

We get the serializer attached to this view and pass the request data. We raise an exception if the data is not valid,
otherwise, we create the new player information record. We then send a response to the Bryntum Grid with a success
message and created-record data if the action was successful.

Now define the `update` action below the `create` action:

```python
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({'success': True, 'data': [serializer.data]}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

The `update` action is similar to the `create` action. We use a partial update to allow the serializer to only validate
the fields supplied in the request.

Define the `delete` action:

```python
    @action(detail=False, methods=['DELETE'])
    def delete(self, request, *args, **kwargs):
        try:
            ids_to_delete = request.data.get('ids', []) # Get list of identifiers from request data
            instances_to_delete = self.queryset.filter(pk__in=ids_to_delete)
            instances_to_delete.delete()
            return Response({'success': True}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

The Bryntum Grid allows for deleting multiple rows at once, but the default `destroy` viewset action only deletes one
row at a time. To allow deleting multiple rows, we define a custom `delete` action. We set the action to loop through
the supplied record IDs and delete the player information records.


##  Create database migration files

To create migration files that will allow us to register table changes in the database, run the following command in the
root folder of the project:

```sh
python manage.py makemigrations 
```

Django will create the initial `api/migrations/0001_initial.py` migration file for our `Player` model. This file defines
the structure of the table to be created in our database.

Apply the migration to the database with the following command:

```sh
python manage.py migrate
```

This will create the necessary tables in our database.

If you make changes to your models, you need to rerun these commands to generate migration files and apply the 
migrations to the database.


## Insert sample data into the database

Let's insert sample player information records in the database. 

We'll use the SQLite command-line tools to make working with SQLite database files easier. The `sqlite` command-line 
tools should already be available on macOS. On other operating systems like Windows, you'll need to download the bundle 
of tools from the [SQLite download page](https://www.sqlite.org/download.html) and add the SQLite directory (the path with the `sqlite3` executable file) 
to your computer's [PATH system variable](https://www.java.com/en/download/help/path.html). Now you can manually enter and execute SQL statements.

Start the `sqlite3` program for your database by running the following command in the root folder of the project:

```sh
sqlite3 db.sqlite3
```

You can view all the tables in the database using the command `.tables` while in the `sqlite3` shell. 

Now we'll insert sample data into the `api_player` table that was created when we applied the table migrations in the 
migration script. Paste the following SQL statement into the command prompt and press Enter. 

```sql
INSERT INTO api_player (name, city, team, score, percentage_wins) VALUES 
('Dan Jones', 'Los Angeles', 'Stockholm Eagles', 430, 30),
('Harry Smith', 'Dubai', 'Paris Lions', 120, 50),
('Peter Holmes', 'Stockholm', 'Washington Ducks', 90, 55),
('Jacob Reese', 'Moscow', 'Washington Ducks', 500, 43),
('Gilles Girard', 'Paris', 'Moscow Bears', 800, 88),
('Dan Jacobsen', 'Moscow', 'Paris Lions', 920, 93),
('Walter Cruise', 'Barcelona', 'Stockholm Eagles', 100, 44),
('Bill Nielsen', 'Madrid', 'Stockholm Eagles', 750, 55),
('Gareth Freeman', 'Chicago', 'Moscow Bears', 310, 33),
('Ben Newman', 'Los Angeles', 'Washington Ducks', 670, 66),
('Garry Miller', 'Paris', 'Paris Lions', 820, 80),
('Jim Knowles', 'Dubai', 'Stockholm Eagles', 440, 53),
('Victor Reddy', 'London', 'Moscow Bears', 960, 93),
('Bradley May', 'Los Angeles', 'Stockholm Eagles', 200, 40),
('Wesley Malone', 'Berlin', 'Washington Ducks', 760, 29);
```

You can view the inserted data using the following SQL query:

```sql
SELECT * FROM api_player;
```

To exit the `sqlite3` program, type `.quit` and press Enter.


## Running the player information application

You can now preview the completed application by running the following command:

```sh
python manage.py runserver localhost:8000
```

Visit `http://localhost:8000`, and you will be able to perform CRUD operations with the data 
displayed on the Bryntum Grid.


## Next Steps

This tutorial covers the basics of using Bryntum Grid with Django REST framework. As a next step, you can take a look at 
the [Bryntum Grid examples page](https://bryntum.com/products/grid/examples/) to see additional features that you can 
add, such as:

- [Exporting data to Excel](https://bryntum.com/products/grid/examples/exporttoexcel/).
- [Custom cell rendering](https://bryntum.com/products/grid/examples/renderers).
- Using a [Tree grid](https://bryntum.com/products/grid/examples/tree).


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>