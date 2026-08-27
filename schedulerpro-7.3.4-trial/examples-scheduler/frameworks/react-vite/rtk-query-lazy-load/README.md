# Lazy loading with RTK Query (React + Vite)

This example uses Bryntum Scheduler Pro wrapped in the provided `BryntumSchedulerPro` wrapper.
Resources and events are lazily loaded on demand via Redux Toolkit Query, so the scheduler scrolls smoothly through large datasets on both axes.

This application was generated with:

* [React](https://react.dev/) [19.2.7]
* [Vite](https://vitejs.dev/guide/) [8.0.16]

# Bryntum Repository access setup

**IMPORTANT NOTE!** These access instructions are mandatory when using the private Bryntum NPM repositories only.

If application uses npm packages from the Bryntum private NPM repository, you must be logged in to this repository as
licensed or trial user to access the packages.

For detailed information on the sign-up and login process, please refer to the 
[Online npm repository guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/npm/repository/private-repository-access).

# React integration guide

Please check the [Bryntum React integration online guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/integration/react/guide) for detailed
integration information and help.

# Installation

Use the following command to install the example packages after the successful login.

Using **npm**:

```shell
npm install
```

Using **yarn**:

```shell
yarn install
```

# Apache requirements

Requirements for this example:

- WebServer (Apache or similar)
- PHP 8.0+

This demo's PHP backend generates the data on the fly, so no database is required.

Please follow the basic PHP installation instructions below. More advanced instructions may be found on the web.

# Basic Apache + PHP installation instructions for Linux

Update the package lists for upgrades and package installations:

```shell
sudo apt update
```

Install Apache web server:

```shell
sudo apt install apache2
```

Enable and start the Apache service:

```shell
sudo systemctl enable apache2
sudo systemctl start apache2
```

Install PHP 8 and required modules:

```shell
sudo apt-get install php8.0 libapache2-mod-php8.0 php8.0-curl php8.0-gd php8.0-mbstring php8.0-xml php8.0-intl php8.0-zip
```

Restart Apache to apply the changes:

```shell
sudo systemctl restart apache2
```

Default webserver pages location is in the `/var/www/html` folder.

# Basic Apache + PHP installation instructions for Windows

Download Apache HTTP Server for Windows from the official website: https://httpd.apache.org/download.cgi. Choose the
latest stable release and download the Windows binary.

Install Apache by running the downloaded installer. Choose "Typical" installation type and follow the prompts.

After the installation is complete, open the `httpd.conf` file located in the `conf` directory inside the Apache
installation folder. Add the following line at the end of the file:

```text
Listen 80
```

Save the `httpd.conf` file and close it.

Download the latest PHP 8 for Windows from the official website: https://www.php.net/downloads.php. Choose the
Non-Thread Safe (NTS) version that matches your system architecture (x86 or x64).

Extract the downloaded PHP archive to a folder of your choice, e.g., `C:\php`.

Rename the `php.ini-development` file to `php.ini` in the PHP installation folder.

Open the `php.ini` file and uncomment (remove the semicolon) the following line:

```text
extension_dir = "ext"
```

Add the PHP installation folder (e.g., `C:\php`) to your system's `PATH` environment variable.

Open the Apache `httpd.conf` file again and add the following lines at the end:

```text
LoadModule php_module "C:/php/php8apache2_4.dll"
AddType application/x-httpd-php .php
PHPIniDir "C:/php"
```

Make sure to adjust the paths if your PHP installation is in a different folder.

Save the `httpd.conf` file and close it.

Restart the Apache HTTP Server by opening the "Services" application, finding the "Apache2.4" service, right-clicking on
it, and selecting "Restart".

Default webserver pages location is in the `htdocs` folder inside the Apache installation directory.

# Basic Apache + PHP installation instructions for MacOS

Update Homebrew, a package manager for macOS:

```shell
brew update
```

If you don't have Homebrew installed, visit https://brew.sh/ and follow the instructions to install it.

Install Apache by running the following command:

```shell
brew install httpd
```

Start Apache using the following command:

```shell
sudo apachectl start
```

To make sure Apache is running, open a web browser and navigate to http://localhost:80.
You should see a message saying "It works!".

Install PHP 8 by running the following command:

```shell
brew install php@8.0
```

Add PHP 8 to your system's PATH environment variable by adding the following line to your ~/.zshrc or ~/.bash_profile file:

```shell
export PATH="/usr/local/opt/php@8.0/bin:$PATH"
```

Restart your terminal or run `source ~/.zshrc` or `source ~/.bash_profile` for the changes to take effect.

Edit the Apache configuration file located at `/usr/local/etc/httpd/httpd.conf`. Uncomment the following line:

```text
LoadModule php_module /usr/local/opt/php@8.0/lib/httpd/modules/libphp8.so
```

Add the following lines at the end of the httpd.conf file:

```text
<FilesMatch \.php$>
SetHandler application/x-httpd-php
</FilesMatch>
```

Default webserver pages location is in the `/usr/local/var/www/` folder.

# Running a development server

To build example and start development server run this command:

Using **npm**:

```shell
npm run start
```

Using **yarn**:

```shell
yarn run start
```

Navigate to `http://localhost:5173/` or `http://127.0.0.1:5173/` in your browser. We recommend to use latest versions of
modern browsers like Chrome, FireFox, Safari or Edge. The app will automatically reload if you change any of
the source files.

# Creating a production build

To build production code for the example run this command:

Using **npm**:

```shell
npm run build
```

Using **yarn**:

```shell
yarn run build
```

The build artifacts will be stored in the `build/` directory.

# Distribution zip references

* Bryntum API docs. Open `docs/index.html` in your browser.
* Bryntum Repository guide `docs/guides/npm-repository.md`.
* Bryntum React integration guide `docs/guides/integration/react/guide.md`.

# Online References

* [Vite](https://vitejs.dev/guide/)
* [React Framework](https://react.dev/)
* [Bryntum React integration guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/integration/react/guide)
* [Bryntum Scheduler Pro documentation](https://bryntum.com/products/schedulerpro/docs/)
* [Bryntum Scheduler Pro examples](https://bryntum.com/products/schedulerpro/examples/)
* [Bryntum npm repository guide](https://bryntum.com/products/schedulerpro/docs/guide/SchedulerPro/npm-repository)
* [Bryntum support Forum](https://forum.bryntum.com/)
* [Contacts us](https://bryntum.com/contact/)
