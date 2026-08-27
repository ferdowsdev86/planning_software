# How to use Bryntum Grid with Django

Bryntum Grid is a high-performance, easily customizable JavaScript grid component that integrates with all major web 
frameworks. 

This guide will show you how to integrate Bryntum Grid with Django. We'll build an application to view racehorse 
statistics in a table.

We will go over: 

- Creating a simple Django application using SQLite as a database. 
- Creating a model to set up the database table to store our horse information records. 
- Writing views that allow Bryntum Grid to perform CRUD operations on the records. 
- Creating a Bryntum Grid frontend to display and modify the racehorse records. 

If you would like to follow along with this guide, clone the 
[starter repo](https://github.com/bryntum/bryntum-grid-django-starter/) containing a basic Django project. You can find 
the code for the completed app in the
[`completed-app`](https://github.com/bryntum/bryntum-grid-django-starter/tree/completed-app) branch. 

## Prerequisites

To follow this guide, you'll need [Python](https://www.python.org/downloads/) installed on your computer. You will also 
need access to Bryntum Grid, which you can download [here](https://customerzone.bryntum.com/). If you do not have a 
license yet, you can sign up for a free trial [here](https://bryntum.com/download/?product=grid).

## Getting started

If you have cloned the starter repo, you'll already have the initial Django project set up and ready to go. 

The app has the following directory structure:

- `grid` containing the main Django project and configuration files. 
- `static`, the folder we will add our static resources to. 
- `templates` containing the HTML templates we will use in the project. 
- `manage.py`, the command-line utility used to manage Django projects. 

This project has one main Python package dependency, Django. 

We will use a virtual environment to install the dependency. To create a virtual environment, run the following command 
in a terminal in the root folder of the project:

```bash
python -m venv venv
```

Activate the virtual environment in your terminal with the following command:

```bash
source venv/bin/activate
```

Install the Django dependency with the following command:

```bash
pip install django
```

The initial Django project is already configured in the following way:

- In the `grid/settings.py` file, the `INSTALLED_APPS` array includes a reference to the `grid` app to make Django aware 
that we will be using this app.
- In the `grid/settings.py` file, the path to the `static` folder is defined in the `STATICFILES_DIRS` array so that 
Django can locate the static files we will use in this project.

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
    'DIRS': [BASE_DIR / 'templates'],
  }
]
```

Start the project by running the following command in the root directory of the project: 

```bash
python manage.py runserver localhost:8000
```

If you visit `http://localhost:8000`, you will see the default Django project landing page. 

## Create the static resources for the Bryntum Grid

To display horse information data in the Bryntum Grid, we need the static resources from the Bryntum Grid distribution 
zip. The resources we need are:

- The JavaScript bundle for the Bryntum Grid
- CSS files
- Locales
- Fonts

These static resources are included in the distribution folder of the free trial version of Bryntum Grid, which you can 
download [here](https://bryntum.com/download/?product=grid). If you have already bought the licensed version of the 
Bryntum Grid, you can log in [here](https://customerzone.bryntum.com/) to download the Grid distribution zip.

Copy the following files and folders from the `/build` folder in the Bryntum Grid distribution folder and paste them 
into the `static/bryntum-grid` folder in the project:

- `fonts`
- `locales`
- `grid.module.js`
- `grid.module.js.map`
- `grid.css`
- `grid.css.map`
- `svalbard-light.css`
- `svalbard-light.css.map`

## Configuring Bryntum Grid AjaxStore to synchronize data changes to the database

Let's configure the Bryntum Grid AjaxStore to synchronize data changes to the database in the project. We will specify 
the create, read, update, and delete URLs and HTTP methods for the project. 

In the `static/bryntum-grid/grid.config.js` file, add the following code to the AjaxStore `store` variable: 

```javascript
createUrl         : '/horse_info/',
readUrl           : '/horse_info/',
updateUrl         : '/horse_info/',
deleteUrl         : '/horse_info/',
autoLoad          : true,
autoCommit        : true,
useRestfulMethods : true,
httpMethods       : {
    read   : 'GET',
    create : 'POST',
    update : 'PATCH',
    delete : 'DELETE'
}
```

## Creating the HTML page to display the Bryntum Grid

Now let's create the HTML page that will display the Bryntum Grid. Add the following code to the `templates/index.html` 
file: 

```html
{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins" />
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
    <title>Racehorse Database</title>
</head>
<body>
<script type="module" src="{% static 'bryntum-grid/grid.config.js' %}"></script>
</body>
</html>
```

This will load the Bryntum Grid configurations specified in the `static/bryntum-grid/grid.config.js` file and styling 
specified in the `static/bryntum-grid/grid.css` & `static/bryntum-grid/svalbard-light.css` files. The configuration file 
attaches Bryntum Grid to the `body` HTML element. We also set the body element to take up the full window height in the 
style configuration. 

## Create the horse information model

We need to define a Django model to specify the structure of the table that will hold information about our racehorses. 
In the `grid` folder, create a `models.py` file and add the following model code to it: 

```python
from django.db import models


class Horse(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    trainer = models.CharField(max_length=100)
    years_raced = models.IntegerField(default=0)
    percentage_wins = models.IntegerField(default=0)

    class Meta:
        db_table = "horses"
```

When we run migrations, a table called `horses` will be created in the database to store the records.

## Creating a CRUD operations view class

Let's write some view functions to perform CRUD operations with the Bryntum Grid. 

In the `grid` folder, create a `views.py` file and add the following imports to it: 

```python
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from .models import Horse
import json
```

Now we'll create the view that displays the main index page. Add the following code below the imports:

```python
def index(request): 
    return render(request, 'index.html')
```

To create a class-based view for CRUD operations in this project, add the following decorated class definition to the 
end of the `grid/views.py` file:

```python
@method_decorator(csrf_exempt, name='dispatch')
class HorseView(View):
```

The `@method_decorator` decorator applies CSRF exemption to the `dispatch` method, which is called whenever any request 
is passed to the class-based view. The `dispatch` method will read the incoming request and decide which methods in the 
class should be used. You can customize the `dispatch` method if needed, but for our purposes, the default will serve. 

While Django does provide some default methods for building class-based views, we will write our own view class methods 
to make sure the response format is in the format expected by the Bryntum Grid. 

Let's start with a simple view method that returns all records in the table. Add the following `get` method to the 
`HorseView` class:

```python
def get(self, request): 
    data = list(Horse.objects.all().values())        
    return JsonResponse({"success": True, "data": data})
```

Here, we use the built-in `.values()` method to serialize the data, then return all the serialized data as JSON along 
with a success code. 

Next we'll write a view method for creating new records. Add the following code to the `HorseView` class:

```python
def post(self, request):
    data = json.loads(request.body)["data"]
    for record in data:
        del record["id"]
        horse = Horse.objects.create(**record)

    return JsonResponse(
        {
            "success": True,
            "data": [
                {
                    "id": horse.id,
                    "name": horse.name,
                    "country": horse.country,
                    "trainer": horse.trainer,
                    "years_raced": horse.years_raced,
                    "percentage_wins": horse.percentage_wins,
                }
            ],
        }
    )
```

When a record is added, this method receives all the input data Bryntum Grid passes and creates the record in the table. 
It then returns the values from the created record with a success code to update the Grid's AjaxStore. 

Now we can define the view method for updating existing records. Add the following code to the `HorseView` class:

```python
def patch(self, request):
    try:
        data = json.loads(request.body)["data"][0]
        horse_id = data["id"]

        Horse.objects.filter(id=horse_id).update(**data)
        horse = Horse.objects.get(pk=horse_id)

        return JsonResponse(
            {
                "success": True,
                "data": [
                    {
                        "id": horse.id,
                        "name": horse.name,
                        "country": horse.country,
                        "trainer": horse.trainer,
                        "years_raced": horse.years_raced,
                        "percentage_wins": horse.percentage_wins,
                    }
                ],
            }
        )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
```

Here, we parse the request we received from Bryntum Grid and extract the `id` of the updated record. Then, we try to 
modify the record in the database. If the action succeeds, we return the modified data with a success code.

Finally, let's create the view method to delete records from the table. Add the following code to the `HorseView` class:

```python
def delete(self, request):
    data = json.loads(request.body)

    try:
        ids_to_delete = data["ids"]
        for x in ids_to_delete:
            Horse.objects.filter(id=x).delete()

        return JsonResponse({"success": True})
    
    except Exception as e: 
        return JsonResponse({"success": False, "error": str(e)}, status=400)
```

Bryntum Grid allows you to delete multiple records in one action, so here we loop through all the supplied IDs and 
delete the corresponding records.

## Configure Django URL routing

For the views we created to be accessible, we need to add them to the Django URLs router. Replace the code in the 
`grid/urls.py` file with the following: 

```python
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('horse_info/', views.HorseView.as_view()),
]
```

We use the `.as_view()` method because Django expects the views specified here to be function-based. This method will 
call the `dispatch` method of the class-based view, which will receive requests and return responses in the correct 
format. 

## Create database migration files

We will now create the database migration files that we need to register table changes in the database. 

Run the following command in the project's root folder: 

```bash
python manage.py makemigrations grid
```

This will generate the migration files in the `grid/migrations` folder. 

To apply these migrations, run: 

```bash
python manage.py migrate
```

This will generate the necessary tables in the database according to the model we defined earlier. If you make any 
changes to the model later on, you will need to rerun these commands to reflect the changes in the database. 

## Insert sample data into the database

Let's add some sample data to the table so we can interact with it using Bryntum Grid. 

We will use the SQLite command line tools for this step. The `sqlite` command-line tools should already be available on 
macOS. On other operating systems like Windows, you'll need to download the bundle of tools from the 
[SQLite download page](https://www.sqlite.org/download.html) and add the SQLite directory (the path with the `sqlite3` 
executable file) to your computer's [PATH system variable](https://www.java.com/en/download/help/path.html). Now you 
can manually enter and execute SQL statements.

Let's start the `sqlite3` program for the project database with the following command: 

```bash
sqlite3 db.sqlite3
```

If you run the `.tables` command, you will see the list of tables in the database. This will include the `horses` table 
created after running the earlier migration. Let's insert some sample data into this table: 

```sql
INSERT INTO horses (name, country, trainer, years_raced, percentage_wins) VALUES
('Kincsem', 'Hungary', 'Robert Hesp', 4, 100),
('Old Rosebud', 'United States', 'Frank D. Weir', 7, 50),
('Maximum Security', 'United States', 'Bob Baffert', 3, 71),
('Black Caviar', 'Australia', 'Peter Moody', 5, 100),
('Peppers Pride', 'United States', 'Joel Marr', 3, 100),
('Admire Moon', 'Japan', 'Hiroyoshi Matsuda', 3, 58),
('Eclipse', 'Great Britain', 'Sullivan', 2, 100), 
('Buckpasser', 'United States', 'Edward A. Neloy', 3, 80),
('Ormonde', 'Great Britain', 'John Porter', 3, 100),
('Equinox', 'Japan', 'Tetsuya Kimura', 3, 80);
```

You can confirm the data has been added successfully by running: 

```sql
SELECT * from horses;
```

We can now exit the `sqlite3` program by running `.quit`. 

## Running the horse information application

Our application is now complete! Let's run the development server: 

```bash
python manage.py runserver localhost:8000
```

If you visit `http://localhost:8000` now, you will be able to view and interact with the Bryntum Grid. 

## Next steps

This guide showcases the basics of integrating Bryntum Grid with Django. For further reading, you can check out the 
Bryntum Grid [examples page](../examples/) to see more features you can use. 


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>