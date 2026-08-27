# Localization

## Introduction

Bryntum Scheduler Pro uses locales for translating texts, date formats and such to different languages. This guide shows you 
how to use the supported locales in Bryntum Scheduler Pro and how to create your own.

Localization is the process of adapting a product to be suitable for a specific region. It is not
only translation of texts from one language to another, but it includes other aspects of adapting the components and
user interface. Such adaptations include:

1. Translations of texts
2. Adjusting date, time, numbers and currency formats
3. Setting the day week starts on
4. Translation of day, months and other units' names
5. Handling of plural forms of words

This guide shows how to use Bryntum's built-in localization and how to extend it to cover the whole application.

## Supported languages

Bryntum Scheduler Pro ships with the following locales:

| Language                 | Locale Name | Locale Code | Locale description       |
|--------------------------|-------------|-------------|--------------------------|
| Arabic (Modern Standard) | Ar          | ar          | اللغة العربية            |
| Basque                   | Eu          | eu-ES       | Euskara                  |
| Bulgarian                | Bg          | bg          | Български                |
| Catalan                  | Ca          | ca-ES       | Català                   |
| Chinese (Simplified)     | ZhCn        | zh-CN       | 简体中文                  |
| Chinese (Taiwan)         | ZhTw        | zh-TW       | 繁體中文 (台灣)           |
| Croatian                 | HR          | hr          | Hrvatski                 |
| Czech                    | Cs          | cs          | Česky                    |
| Danish                   | Da          | da          | Dansk                    |
| Dutch                    | Nl          | nl          | Nederlands               |
| English (Great Britain)  | EnGb        | en-GB       | English (Great Britain)  |
| English (United States)* | En          | en-US       | English (US)             |
| Estonian                 | Et          | et          | Eesti keel               |
| Finnish                  | Fi          | fi          | Suomi                    |
| French (France)          | FrFr        | fr-FR       | Français (France)        |
| Galician                 | Gl          | gl-ES       | Galego                   |
| German                   | De          | de          | Deutsch                  |
| Greek                    | El          | el          | Ελληνικά                 |
| Hebrew                   | He          | he          | עִברִית                    |
| Hindi                    | Hi          | hi          | हिन्दी                      |
| Hungarian                | Hu          | hu          | Magyar                   |
| Indonesian               | Id          | id          | Bahasa Indonesia         |
| Italian                  | It          | it          | Italiano                 |
| Japanese                 | Ja          | ja          | 日本語                    |
| Kazakh                   | Kk          | kk-KZ       | Қазақ тілі (KZ)          |
| Korean                   | Ko          | ko          | 한국어                    |
| Latvian                  | Lv          | lv-LV       | Latviešu                 |
| Lithuanian               | Lt          | lt-LT       | Lietuvių                 |
| Malay                    | Ms          | ms          | Melayu                   |
| Norwegian                | No          | no          | Norsk                    |
| Polish                   | Pl          | pl          | Polski                   |
| Portuguese               | Pt          | pt          | Português                |
| Portuguese (Brazil)      | PtBr        | pt-BR       | Português (Brasil)       |
| Romanian                 | Ro          | ro          | Română                   |
| Russian                  | Ru          | ru          | Русский                  |
| Serbian                  | Sr          | sr          | Srpski                   |
| Serbian (Cyrillic)       | SrRs        | sr-RS       | Српски (ћирилица)        |
| Slovak                   | Sk          | sk          | Slovenský                |
| Slovene                  | Sl          | sl          | Slovensko                |
| Spanish                  | Es          | es          | Español                  |
| Swedish                  | SvSE        | sv-SE       | Svenska                  |
| Thai                     | Th          | th          | ไทย                      |
| Turkish                  | Tr          | tr          | Türkçe                   |
| Ukrainian                | Uk          | uk-UA       | Українська               |
| Vietnamese               | Vi          | vi          | Tiếng Việt               |

<sup>*</sup> **English (United States)** is the default locale.

## The structure of a Locale

A locale is a collection of data that defines the texts and other settings for a specific language and country.
Technically, it is an object which encapsulates this data. The translation of locale strings is grouped by class names.
Here is a small excerpt from the English Core locale:

```javascript
const locale = {

    localeName : 'En',
    localeDesc : 'English (US)',
    localeCode : 'en-US',

    DateField : {
        invalidDate : 'Invalid date input'
    },

    DatePicker : {
        gotoPrevYear  : 'Go to previous year',
        gotoPrevMonth : 'Go to previous month',
        gotoNextMonth : 'Go to next month',
        gotoNextYear  : 'Go to next year'
    },

    NumberFormat : {
        locale   : 'en-US',
        currency : 'USD'
    },
    ...
}
```

## Using source code, module and UMD bundles

To manage locales in your app, you use the `LocaleHelper` and `LocaleHelper` classes that can be imported using the 
following paths:<br>

* `PATH_TO_LIB` targets the **lib** source folder of the distribution zip. Available for licensed version only.
* `PATH_TO_BUILD` targets the **build** source folder of the distribution zip or the **node_modules/@bryntum/schedulerpro**
  folder if npm packages were used.

Importing for JavaScript code compatible with ES modules can be done with

Import from source:

```javascript
import LocaleHelper from 'PATH_TO_LIB/Core/localization/LocaleHelper.js';
import LocaleManager from 'PATH_TO_LIB/Core/localization/LocaleManager.js';
```

or import from module bundle:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';
```

For UMD compatibility you may use this code:

HTML:

```html
<script src="PATH_TO_BUILD/schedulerpro.umd.js"></script>
```

JavaScript:

```javascript
const { LocaleManager } = window.bryntum.schedulerpro;
```

The code below shows import from module bundle for simplicity, but you may convert it to importing from umd or source if
you want.

## Publishing and applying locales

Bryntum Scheduler Pro ships with two locale management classes [LocaleHelper](#Core/localization/LocaleHelper) and
[LocaleManager](#Core/localization/LocaleManager) which contain methods for publishing new and applying existing
locales.

The key methods and properties are:

[LocaleHelper.locales](#Core/localization/LocaleHelper#property-locales-static) - contains currently available locales.

[LocaleHelper.locale](#Core/localization/LocaleHelper#property-locale-static) - the currently active locale.

[LocaleHelper.publishLocale](#Core/localization/LocaleHelper#function-publishLocale-static) - used to publish locale 
which can be used later:

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

const locale = {

    localeName : 'En',
    localeDesc : 'English (US)',
    localeCode : 'en-US',

    // ...(locale key:value pairs)

}
LocaleHelper.publishLocale(locale);
```  

[LocaleManager.applyLocale](#Core/localization/LocaleManager#function-applyLocale) - used to set the active locale:

```javascript
import { LocaleManager } from 'PATH_TO_BUILD/schedulerpro.module.js';

LocaleManager.applyLocale('SvSE');
```

Simple assignment is also possible with [LocaleHelper.locale](#Core/localization/LocaleManager#property-locale)
property:

```javascript
import { LocaleManager } from 'PATH_TO_BUILD/schedulerpro.module.js';

LocaleManager.locale = 'SvSE';
```

## Enabling a locale with a script tag

Built locales are located in the `PATH_TO_BUILD/locales` folder. These locales are in UMD format and can be included on 
pages using normal script tags.

To include on a page using a `<script>` tag:

```html
<script src="PATH_TO_BUILD/locales/schedulerpro.locale.SvSE.js"></script>
```

By default, the first included locale is applied, but you can specify the `data-default-locale` attribute on any `<script>`
tag in your HTML page to set the one to use:

```html
<script data-default-locale="De" src="app.js"></script>
```

<div class="note">

The default English (US) locale is part of the Bryntum Scheduler Pro bundle, you don't need to include it separately.

</div>

## Enabling locale with module imports

It is also possible to import locales directly from JavaScript code using the `import` statement.
This approach naturally works for frameworks such as Angular, React, Vue and others and is preferred whenever possible.

Locales would be imported at the beginning of the application code:

```javascript
import 'PATH_TO_BUILD/locales/schedulerpro.locale.SvSE.js';
```

<div class="note">

The default English locale is part of the Bryntum Scheduler Pro bundle, you don't need to import it separately.

</div>

## Switching locale

You can also use `LocaleManager` from code to switch locale at any point:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

LocaleManager.locale = 'SvSE';
// or
LocaleManager.locale = LocaleHelper.locales.SvSE;
// or
LocaleManager.applylocale('SvSE');
// or
LocaleManager.applylocale(LocaleHelper.locales.SvSE);
```

## Extend existing locale

To extend an existing locale with additional localizations, first create an object with `localeName` property matching the
exising locale and add required localization `key:value`  pairs to it. Then use the
[LocaleHelper.publishLocale](#Core/localization/LocaleHelper#function-publishLocale-static) method to apply your 
localization changes to the existing locale.

Example code for extending `SvSE` locale:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';
// Import default locale SvSE first. This will also publish it
import 'PATH_TO_BUILD/locales/schedulerpro.locale.SvSE.js';

const newLocalization = {

    List : {
        loading : 'Listan laddas...'
    },

    // ...(your custom locale key:value pairs)
}

// Extend locale
LocaleHelper.publishLocale('SvSE', newLocalization);

// Or extend and apply locale
LocaleManager.applyLocale('SvSE', newLocalization);
```

## Create a custom locale

To create a custom locale from scratch, create an object with `localeName`, `localeDesc` and `localeCode` properties and 
add the required localization `key:value` pairs to it. Then use
[LocaleHelper.publishLocale](#Core/localization/LocaleHelper#function-publishLocale-static) method to make it 
available for applying.

Example code for a full `Custom` locale:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

const locale = {

    localeName : 'Custom',
    localeDesc : 'Custom locale',
    localeCode : 'en-US',

    List : {
        loading : 'Your custom localization for loading'
    },

    // ... (your custom locale key:value pairs)
}

// Publish locale
LocaleHelper.publishLocale(locale);

// Apply locale
LocaleManager.locale = 'Custom';
```

**Note** that your "Custom" locale should have all localization keys to provide full localization. Copy code from
[Full locale](##full-locale) to create a new locale.

Example code for a Custom locale based on the existing SvSE locale:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';
// Import default locale SvSE first. This will also publish it
import SvSELocale from 'PATH_TO_BUILD/locales/schedulerpro.locale.SvSE.js';

const locale = {

    localeName : 'Custom',
    localeDesc : 'Custom Swedish',
    localeCode : 'sv-SE',

    List : {
        loading : 'Listan laddas...'
    },

    // ... (your custom locale key:value pairs)
}

// Here we merge existing Swedish locale key:value pairs with the Custom locale
const mergedLocale = LocaleHelper.mergeLocales(SvSELocale, locale);
// Publish merged locale
LocaleHelper.publishLocale(mergedLocale);
// Apply locale
LocaleManager.locale = 'Custom';
```

## Change single entries

It is also possible to change the translation of most items one by one at runtime. Try the following approach, but
please note that any string already displayed in the UI will not change:

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

// Change for current locale
LocaleHelper.locale.List.loading = 'Loading ...';
// or change for any other locale
LocaleHelper.locales.En.List.loading = 'Loading ...';
```

<div class="note">

Please note that each published locale is represented with 
<a href="#Core/localization/LocaleHelper#typedef-Locale">Locale</a> object which includes localization pairs.

</div>

## Using the L function

The `L` function executes the translation itself and returns the localized string. The `L` function is implemented in 
the [Localizable](#Core/localization/Localizable) mixin that is mixed into each Bryntum widget so that accessing it is 
easy.

```javascript
// Get the translation used in the snippets above
const translation = List.L('loading');
```

<div class="note">

If you cannot see the docs for the <code>L</code> function, click the top-right "Show" button and make sure you have 
"Show Advanced APIs" checked

</div>

The static translations described above are enough in most cases, but they will not do for more complex
tasks where we want to implement a complex pluralization or any other localization that is based on runtime data.
For these to work we need to use functions with placeholders.

For example:

```javascript
const locale = {
    Button : {
        'Invoice button' : count => `View ${count} invoices`,
    }
}
```

The function takes one argument `data` (it can be an object) that can be used to compose the resulting displayed text (a
simple concatenation in this case). The `data` argument is passed to this function from the `L` call.

`L` must in this scenario be called with 2 arguments, for example:

```javascript
const setInvoiceButtonText = () => {
    const invoiceButton = panel.widgetMap.invoiceButton;
    invoiceButton.text = myButton.L('Invoice button', nbrUnpaidInvoices);
}
```

The first argument is the text to translate (`'My button'` in this case) and second argument is any kind of `data`
needed for the locale function (any number in this case).

Install [locale](#Core/localization/LocaleManager#event-locale) event listener on `LocaleManager` that invokes the
translations on locale change, for example:

```javascript
LocaleManager.on('locale', () => {
    setInvoiceButtonText();
});
```

## Change date formats

Dates are formatted using
[Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).
The full list of locales according to BCP 47 standard is available
[here](http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry).

When you create a custom locale, you need to update the `DateHelper.locale` property according to your country code. For
example, if you create a Spanish locale, you need to set:

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

const locale = {

    localeName : 'Es',
    localeDesc : 'Español',
    localeCode : 'es',

    DateHelper : {
        locale : 'es-ES'
    }
}

LocaleHelper.publishLocale(locale);
```

Bryntum Scheduler Pro uses [ViewPreset](#Scheduler/preset/ViewPreset) to configure the timeaxis header and the date format
used by tooltips and similar. A `ViewPreset` defines the header rows displayed in the timeaxis header, from
one to three levels named bottom, middle and top. When creating a custom locale, you might want to change the date
format for these levels to suite your needs. This can be achieved by creating an entry for
[PresetManager](#Scheduler/preset/PresetManager) with sub entries per `ViewPreset`.

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/schedulerpro.module.js';

const locale = {

    localeName : 'En',

    PresetManager : {
        // Translation for the "weekAndDay" ViewPreset
        weekAndDay : {
            // Date format used by tooltips etc.
            displayDateFormat : 'll hh:mm A',
            // Change the date format for the middle and top levels
            topDateFormat    : 'MMM',
            middleDateFormat : 'D'
        }
    }
}

LocaleHelper.publishLocale(locale);
```

This table lists all the built-in ViewPresets, the unit and the date formats they use for the header levels:

| Preset           |Bottom       |Middle                 | Top                   |
|------------------|-------------|-----------------------|-----------------------|
| secondAndMinute  |             |second, `ss`           | minute, `llll`        |
| minuteAndHour    |             |minute, `mm`           | hour, `ddd MM/DD, hA` |
| hourAndDay       |             |hour, `LT`             | day, `ddd DD/MM`      |
| day              |hour, *      |day, `ddd DD/MM`       |                       |
| dayAndWeek       |             |day, `dd DD`           | week, *               |
| dayAndMonth      |             |month, `MMMM YYYY`     | day, `DD`             |
| weekAndDay       |day, `DD MMM`|week, `YYYY MMMM DD`   |                       |
| weekAndDayLetter |day, *       |week, `ddd DD MMM YYYY`|                       |
| week             |hour, *      |week, `D d`            |                       |
| weekAndMonth     |             |week, `DD MMM`         | month, `MMM YYYY`     |
| weekDateAndMonth |             |week, `DD`             | month, `YYYY MMMM`    |
| monthAndYear     |             |month, `MMM YYYY`      | year, `YYYY`          |
| year             |             |quarter, *             | year, `YYYY`          |
| manyYears        |year, `YYYY` |year, `YY`             |                       |

\* Formatted using a function

In case you want to localize date formats for the default zoom levels in Bryntum Scheduler Pro, these are the ViewPresets
used:

* manyYears
* year
* monthAndYear
* weekDateAndMonth
* weekAndMonth
* weekAndDayLetter
* weekAndDay
* hourAndDay
* minuteAndHour
* secondAndMinute

## Change week start day

The week start day depends on the current locale by default. To change it, configure `weekStartDay` config of the
`DateHelper` class:

```javascript
const locale = {
    DateHelper : {
        weekStartDay : 1 // 0-6 (0: Sunday, 1: Monday etc.)
    }
}
```

Note, a [weekStartDay](#Scheduler/view/TimelineBase#config-weekStartDay) value defined on the Bryntum Scheduler Pro
instance overrides the value in the `DateHelper` localization.

## Recurrence legend

Please check the comments below for localizing recurrence legend values for Bryntum Scheduler Pro:

```javascript
locale = {
    RecurrenceLegend : {
        // frequency patterns
        Daily : 'Daily',
        // Weekly on Sunday
        // Weekly on Sun, Mon and Tue
        'Weekly on {1}' : ({ days }) => `Weekly on ${days}`,
        // Monthly on 16
        // Monthly on the last weekday
        'Monthly on {1}' : ({ days }) => `Monthly on ${days}`,
        // Yearly on 16 of January
        // Yearly on the last weekday of January and February
        'Yearly on {1} of {2}' : ({ days, months }) => `Yearly on ${days} of ${months}`,
        // Every 11 days
        'Every {0} days' : ({ interval }) => `Every ${interval} days`,
        // Every 2 weeks on Sunday
        // Every 2 weeks on Sun, Mon and Tue
        'Every {0} weeks on {1}' : ({ interval, days }) => `Every ${interval} weeks on ${days}`,
        // Every 2 months on 16
        // Every 2 months on the last weekday
        'Every {0} months on {1}' : ({ interval, days }) => `Every ${interval} months on ${days}`,
        // Every 2 years on 16 of January
        // Every 2 years on the last weekday of January and February
        'Every {0} years on {1} of {2}' : ({
                                               interval,
                                               days,
                                               months
                                           }) => `Every ${interval} years on ${days} of ${months}`,
        // day position translations
        position1    : 'the first',
        position2    : 'the second',
        position3    : 'the third',
        position4    : 'the fourth',
        position5    : 'the fifth',
        'position-1' : 'the last',
        // day options
        day           : 'day',
        weekday       : 'weekday',
        'weekend day' : 'weekend day',
        // {0} - day position info ("the last"/"the first"/...)
        // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
        // For example:
        //  "the last Sunday"
        //  "the first weekday"
        //  "the second weekend day"
        daysFormat : ({ position, days }) => `${position} ${days}`
    }
}
```

## Localization demo

The <a href="../examples/localization" target="_blank">localization demo</a> (found at **examples/localization**)
has custom locales under `locales` folder.

You can inspect the Localization demo and the locale files to see how to create your own locales and how to use
them in your application.

## Full locale

The code below contains full localization for Bryntum Scheduler Pro which can be used for creating new locales.

```javascript
const emptyString = new String();

const locale = {

    localeName : 'En',
    localeDesc : 'English (US)',
    localeCode : 'en-US',
    localeRtl  : false,

    Object : {
        Yes         : 'Yes',
        No          : 'No',
        Cancel      : 'Cancel',
        Ok          : 'OK',
        Week        : 'Week',
        None        : 'None',
        previous    : 'Previous',
        next        : 'Next',
        to          : 'to',
        at          : 'At',
        on          : 'On',
        editing     : what => `Editing ${what}`,
        settings    : 'Settings',
        close       : 'Close',
        go          : 'Go',
        save        : 'Save',
        cancel      : 'Cancel',
        revert      : 'Revert',
        collapse    : 'Collapse',
        expand      : 'Expand',
        today       : 'Today',
        andNMore    : n => `and ${n} more`,
        newEvent    : 'New event',
        information : 'Information',
        showDetails : 'Show details'
    },

    AIBase : {
        delayStatusTexts : [
            'Waiting',
            'Waiting ...',
            'Still waiting',
            'Still waiting ...'
        ],
        autoStartDialogMessage        : 'Do you want to enable AI voice activation?',
        voiceActivationToast          : phrase => `Voice activation enabled, use the phrase "${phrase}" to start a conversation`,
        voiceControlNotSupportedToast : 'Voice control is not supported on this device',
        voiceControlErrorToast        : 'Voice control could not be started on your device',
        voiceControlSilenceToast      : phrase => `AI voice conversation ended due to silence. Use the phrase ${phrase} to restart the conversation`,
        noAudioDetected               : 'No audio detected, please try again',
        transcriptionErrorToast       : 'Transcription failed, please try again',
        playbackErrorToast            : 'Audio playback failed, please check your audio output device',
        failed                        : '(failed)',
        awaitingConfirmation          : 'Awaiting confirmation',
        timeoutToast                  : 'Message timed out',
        readingStatusText             : modelName => `Reading ${modelName}s`,
        updatingStatusText            : modelName => `Updating ${modelName}s`,
        removingStatusText            : modelName => `Removing ${modelName}s`,
        addingStatusText              : modelName => `Adding ${modelName}`,
        filteringStatusText           : modelName => `Filtering ${modelName}s`,
        thinkingStatusText            : 'Thinking',
        processingStatusText          : 'Processing'
    },

    AISettingsPanel : {
        highlight               : 'Highlight',
        verbosity               : 'Verbosity',
        voiceActivation         : 'Voice Activation',
        enableVoiceActivation   : 'Enable voice activation',
        voiceOnly               : 'Voice Only',
        autostart               : 'Autostart',
        dataChangeConfirmations : 'Data Change Confirmation',
        add                     : 'Add',
        remove                  : 'Remove',
        update                  : 'Update',
        planning                : 'Planning',
        enablePlanning          : 'Enable planning',
        aiModel                 : 'AI Model',
        timeline                : 'Timeline',
        'in-view'               : 'In view',
        all                     : 'All',
        timeRangeContext        : 'Time range context'
    },

    ChatButton : {
        tooltipPartSeparator  : ' - ',
        speakingTooltip       : 'AI is speaking',
        recordingTooltip      : 'Recording',
        waitingTooltip        : 'AI thinking',
        startRecordingTooltip : 'Click to start',
        stopRecordingTooltip  : 'Click to stop',
        inactiveTooltip       : 'Not recording',
        openChatTooltip       : 'Right click to open chat'
    },

    ChatPanel : {
        messageFieldPlaceholder : 'Type a message',
        noConnectionTooltip     : 'No connection detected, click to try again',
        undone                  : 'undone',
        aborted                 : '(aborted)',
        readAloudTooltip        : 'Read message aloud',
        confidenceTooltip       : confidence => `Confidence: ${confidence}%`,
        undoTooltip             : 'Undo data changes',
        redoTooltip             : 'Redo data changes',
        thumbsUp                : 'Thumbs up',
        thumbsDown              : 'Thumbs down',
        feedbackToast           : 'Thank you for your feedback!',
        clearChat               : 'Clear chat',
        closeChat               : 'Close chat',
        settings                : 'Settings',
        closeSettings           : 'Close settings'
    },

    CheckboxGroup : {
        wrongNbrOfOptionsSelected : min => `Select exactly ${min}`,
        tooFewOptionsSelected     : min => `Select at least ${min}`,
        tooManyOptionsSelected    : max => `Select no more than ${max}`
    },

    CodeEditor : {
        apply        : 'Apply',
        autoApply    : 'Auto apply',
        downloadCode : 'Download code'
    },

    ColorPicker : {
        noColor : 'No color'
    },

    Combo : {
        noResults          : 'No results',
        recordNotCommitted : 'Record could not be added',
        addNewValue        : value => `Add ${value}`
    },

    ConfirmationDialog : {
        highlight       : 'Highlight',
        preview         : 'Preview',
        approve         : 'Approve',
        reject          : 'Reject',
        confirmAdd      : 'Confirm add:',
        confirmUpdate   : 'Confirm update:',
        confirmRemove   : 'Confirm remove:',
        confirmCopy     : 'Confirm copy',
        confirmAssign   : 'Confirm assignment',
        confirmReassign : 'Confirm re-assignment',
        confirmUnassign : 'Confirm unassignment',
        confirmLink     : 'Confirm link',
        confirmUnlink   : 'Confirm unlink'
    },

    FilePicker : {
        file : 'File'
    },

    Field : {
        badInput              : 'Invalid field value',
        patternMismatch       : 'Value should match a specific pattern',
        rangeOverflow         : value => `Value must be less than or equal to ${value.max}`,
        rangeUnderflow        : value => `Value must be greater than or equal to ${value.min}`,
        stepMismatch          : 'Value should fit the step',
        tooLong               : 'Value should be shorter',
        tooShort              : 'Value should be longer',
        typeMismatch          : 'Value is required to be in a special format',
        valueMissing          : 'This field is required',
        invalidValue          : 'Invalid field value',
        minimumValueViolation : 'Minimum value violation',
        maximumValueViolation : 'Maximum value violation',
        fieldRequired         : 'This field is required',
        validateFilter        : 'Value must be selected from the list'
    },

    DateField : {
        invalidDate : format => 'Invalid date input, expected format is ' + format
    },

    DatePicker : {
        gotoPrevYear  : 'Go to previous year',
        gotoPrevMonth : 'Go to previous month',
        gotoNextMonth : 'Go to next month',
        gotoNextYear  : 'Go to next year',
        navigation    : 'Date picker navigation'
    },

    Hint : {
        dontShowAgain : "Don't show again"
    },

    NumberFormat : {
        locale   : 'en-US',
        currency : 'USD'
    },

    DurationField : {
        invalidUnit : 'Invalid unit'
    },

    TimeField : {
        invalidTime : 'Invalid time input'
    },

    TimePicker : {
        hour   : 'Hour',
        minute : 'Minute',
        second : 'Second'
    },

    Tooltip : {
        loading : 'Loading...'
    },

    List : {
        loading   : 'Loading...',
        selectAll : 'Select All'
    },

    GridBase : {
        loadMask           : 'Loading...',
        syncMask           : 'Saving changes, please wait...',
        loadFailedMessage  : 'Data loading failed!',
        syncFailedMessage  : 'Data synchronization failed!',
        unspecifiedFailure : 'Unspecified failure',
        networkFailure     : 'Network error',
        parseFailure       : 'Failed to parse server response',
        serverResponse     : 'Server response:',
        noRows             : 'No records to display',
        moveColumnLeft     : 'Move to left section',
        moveColumnRight    : 'Move to right section',
        moveColumnTo       : region => `Move column to ${region}`,
        filteredRecords    : n => n ? (n === 1 ? `1 row matches filter` : `${n} rows match filter`) : 'No rows match filter'
    },

    PagingToolbar : {
        firstPage         : 'Go to first page',
        prevPage          : 'Go to previous page',
        page              : 'Page',
        nextPage          : 'Go to next page',
        lastPage          : 'Go to last page',
        reload            : 'Reload current page',
        noRecords         : 'No records to display',
        pageCountTemplate : data => `of ${data.lastPage}`,
        summaryTemplate   : data => `Displaying records ${data.start} - ${data.end} of ${data.allCount}`
    },

    Popup : {
        close    : 'Close',
        maximize : 'Maximize'
    },

    TabPanel : {
        containsInvalidFields : 'Tab contains invalid fields'
    },

    Toolbar : {
        showOverflowingItems : 'Show overflowing items',
        scrollForMore        : 'Scroll for more'
    },

    UndoRedo : {
        Undo           : 'Undo',
        Redo           : 'Redo',
        UndoLastAction : 'Undo last action',
        RedoLastAction : 'Redo last undone action',
        NoActions      : 'No items in the undo queue'
    },

    FieldFilterPicker : {
        equals                 : 'equals',
        doesNotEqual           : 'does not equal',
        isEmpty                : 'empty',
        isNotEmpty             : 'not empty',
        contains               : 'contains',
        doesNotContain         : 'does not contain',
        startsWith             : 'starts with',
        endsWith               : 'ends with',
        isOneOf                : 'one of',
        isNotOneOf             : 'not one of',
        isGreaterThan          : 'greater than',
        isLessThan             : 'less than',
        isGreaterThanOrEqualTo : 'greater or equals',
        isLessThanOrEqualTo    : 'less or equals',
        isBetween              : 'between',
        isNotBetween           : 'not between',
        isBefore               : 'before',
        isAfter                : 'after',
        timeEquals             : 'time equals',
        timeDoesNotEqual       : 'time does not equal',
        isToday                : 'today',
        isTomorrow             : 'tomorrow',
        isYesterday            : 'yesterday',
        isThisWeek             : 'this week',
        isNextWeek             : 'next week',
        isLastWeek             : 'last week',
        isThisMonth            : 'this month',
        isNextMonth            : 'next month',
        isLastMonth            : 'last month',
        isThisYear             : 'this year',
        isNextYear             : 'next year',
        isLastYear             : 'last year',
        isYearToDate           : 'year to date',
        isTrue                 : 'true',
        isFalse                : 'false',
        selectAProperty        : 'Select property',
        selectAnOperator       : 'Select operator',
        caseSensitive          : 'Case-sensitive',
        and                    : 'and',
        dateFormat             : 'D/M/YY',
        selectValue            : 'Select value',
        selectOneOrMoreValues  : 'Select value(s)',
        enterAValue            : 'Enter value',
        enterANumber           : 'Enter number',
        selectADate            : 'Select date',
        selectATime            : 'Select time'
    },

    FieldFilterPickerGroup : {
        addFilter : 'Add filter',
        applyCond : applied => applied ? 'Skip filter (currently applied)' : 'Apply filter (currently skipped)'
    },

    DateHelper : {
        locale         : 'en-US',
        weekStartDay   : 0,
        nonWorkingDays : {
            0 : true,
            6 : true
        },
        weekends : {
            0 : true,
            6 : true
        },
        unitNames : [
            { single : 'millisecond', plural : 'ms', abbrev : 'ms' },
            { single : 'emillisecond', plural : 'ems', abbrev : 'ems' },
            { single : 'second', plural : 'seconds', abbrev : 's' },
            { single : 'esecond', plural : 'eseconds', abbrev : 'es' },
            { single : 'minute', plural : 'minutes', abbrev : 'min' },
            { single : 'eminute', plural : 'eminutes', abbrev : 'emin' },
            { single : 'hour', plural : 'hours', abbrev : 'h' },
            { single : 'ehour', plural : 'ehours', abbrev : 'eh' },
            { single : 'day', plural : 'days', abbrev : 'd' },
            { single : 'eday', plural : 'edays', abbrev : 'ed' },
            { single : 'week', plural : 'weeks', abbrev : 'w' },
            { single : 'eweek', plural : 'eweeks', abbrev : 'ew' },
            { single : 'month', plural : 'months', abbrev : 'mon' },
            { single : 'emonth', plural : 'emonths', abbrev : 'emon' },
            { single : 'quarter', plural : 'quarters', abbrev : 'q' },
            { single : 'equarter', plural : 'equarters', abbrev : 'eq' },
            { single : 'year', plural : 'years', abbrev : 'yr' },
            { single : 'eyear', plural : 'eyears', abbrev : 'eyr' },
            { single : 'decade', plural : 'decades', abbrev : 'dec' },
            { single : 'edecade', plural : 'edecades', abbrev : 'edec' }
        ],
        unitAbbreviations : [
            ['mil'],
            ['emil'],
            ['s', 'sec'],
            ['es', 'esec'],
            ['m', 'min'],
            ['em', 'emin'],
            ['h', 'hr'],
            ['eh', 'ehr'],
            ['d'],
            ['ed'],
            ['w', 'wk'],
            ['ew', 'ewk'],
            ['mo', 'mon', 'mnt', 'M'],
            ['emo', 'emon', 'emnt'],
            ['q', 'quar', 'qrt'],
            ['eq', 'equar', 'eqrt'],
            ['y', 'yr'],
            ['ey', 'eyr'],
            ['dec'],
            ['edec']
        ],
        parsers : {
            L   : 'MM/DD/YYYY',
            LT  : 'HH:mm A',
            LTS : 'HH:mm:ss A'
        },
        ordinalSuffix : number => {
            const hasSpecialCase = ['11', '12', '13'].find((n) => number.endsWith(n));

            let suffix = 'th';

            if (!hasSpecialCase) {
                const lastDigit = number[number.length - 1];
                suffix = { 1 : 'st', 2 : 'nd', 3 : 'rd' }[lastDigit] || 'th';
            }

            return number + suffix;
        },
        decade : date => {
            const year = typeof date === 'number' ? date : date.getFullYear();
            return `${year - (year % 10)}s`;
        }
    },

    ChecklistFilterCombo : {
        search      : 'Search',
        selectAll   : 'Select All',
        removeAll   : 'Remove All',
        filtersSet  : n => n === 1 ? `1 filter set` : `${n} filters set`,
        noItems     : 'No results found',
        placeholder : 'Filter...',
        apply       : 'Apply'
    },

    ColumnPicker : {
        column          : 'Column',
        columnsMenu     : 'Columns',
        hideColumn      : 'Hide column',
        hideColumnShort : 'Hide',
        newColumns      : 'New columns',
        showName        : column => `Show column${column.text ? ` ${column.text}` : ''}`,
        hideName        : column => `Hide column${column.text ? ` ${column.text}` : ''}`
    },

    Filter : {
        applyFilter   : 'Apply filter',
        filter        : 'Filter',
        editFilter    : 'Edit filter',
        on            : 'On',
        before        : 'Before',
        after         : 'After',
        equals        : 'Equals',
        lessThan      : 'Less than',
        moreThan      : 'More than',
        removeFilter  : 'Remove filter',
        disableFilter : 'Disable filter'
    },

    FilterBar : {
        enableFilterBar  : 'Show filter bar',
        disableFilterBar : 'Hide filter bar'
    },

    Group : {
        group                : 'Group',
        groupAscending       : 'Group ascending',
        groupDescending      : 'Group descending',
        groupAscendingShort  : 'Ascending',
        groupDescendingShort : 'Descending',
        stopGrouping         : 'Stop grouping',
        stopGroupingShort    : 'Stop'
    },

    HeaderMenu : {
        moveBefore     : text => `Move before "${text}"`,
        moveAfter      : text => `Move after "${text}"`,
        collapseColumn : 'Collapse column',
        expandColumn   : 'Expand column'
    },

    ColumnRename : {
        rename : 'Rename'
    },

    MergeCells : {
        mergeCells  : 'Merge cells',
        menuTooltip : 'Merge cells with same value when sorted by this column'
    },

    Search : {
        searchForValue : 'Search for value'
    },

    Sort : {
        sort                   : 'Sort',
        sortAscending          : 'Sort ascending',
        sortDescending         : 'Sort descending',
        multiSort              : 'Multi sort',
        removeSorter           : 'Remove sorter',
        addSortAscending       : 'Add ascending sorter',
        addSortDescending      : 'Add descending sorter',
        toggleSortAscending    : 'Change to ascending',
        toggleSortDescending   : 'Change to descending',
        sortAscendingShort     : 'Ascending',
        sortDescendingShort    : 'Descending',
        removeSorterShort      : 'Remove',
        addSortAscendingShort  : '+ Ascending',
        addSortDescendingShort : '+ Descending'
    },

    Split : {
        split        : 'Split',
        unsplit      : 'Unsplit',
        horizontally : 'Horizontally',
        vertically   : 'Vertically',
        both         : 'Both'
    },

    LockRows : {
        lockRow   : 'Lock row',
        unlockRow : 'Unlock row'
    },

    ActionColumn : {
        rowActions : 'Row actions'
    },

    Column : {
        columnLabel : column => `${column.text ? `${column.text} column. ` : ''}SPACE for context menu${column.canSort ? ', ENTER to sort' : ''}`,
        cellLabel   : emptyString
    },

    WidgetColumn : {
        rowWidgets : 'Row widgets'
    },

    Checkbox : {
        toggleRowSelect : 'Toggle row selection',
        toggleSelection : 'Toggle selection of entire dataset',
        toggleName      : column => `Toggle ${column.text || 'value'}`
    },

    RatingColumn : {
        cellLabel : column => `${column.text ? column.text : ''} ${column.location?.record ? `rating : ${column.location.record.get(column.field) || 0}` : ''}`
    },

    RowNumberColumn : {
        rowNumber : 'Row number'
    },

    CellMenu : {
        removeRow : 'Delete'
    },

    RowCopyPaste : {
        copyRecord  : 'Copy',
        cutRecord   : 'Cut',
        pasteRecord : 'Paste',
        rows        : 'rows',
        row         : 'row'
    },

    CellCopyPaste : {
        copy  : 'Copy',
        cut   : 'Cut',
        paste : 'Paste'
    },

    Charts : {
        chartDesigner : 'Chart Designer',
        newChart      : 'New Chart',
        download      : 'Download',
        settings      : 'Settings'
    },

    PdfExport : {
        'Waiting for response from server' : 'Waiting for response from server...',
        'Export failed'                    : 'Export failed',
        'Server error'                     : 'Server error',
        'Generating pages'                 : 'Generating pages...',
        'Click to abort'                   : 'Cancel'
    },

    ExportDialog : {
        width          : '40em',
        labelWidth     : '12em',
        exportSettings : 'Export settings',
        export         : 'Export',
        printSettings  : 'Print settings',
        print          : 'Print',
        exporterType   : 'Control pagination',
        cancel         : 'Cancel',
        fileFormat     : 'File format',
        rows           : 'Rows',
        alignRows      : 'Align rows',
        columns        : 'Columns',
        paperFormat    : 'Paper format',
        orientation    : 'Orientation',
        repeatHeader   : 'Repeat header'
    },

    ExportRowsCombo : {
        all     : 'All rows',
        visible : 'Visible rows'
    },

    ExportOrientationCombo : {
        portrait  : 'Portrait',
        landscape : 'Landscape'
    },

    SinglePageExporter : {
        singlepage : 'Single page'
    },

    SinglePageUnscaledExporter : {
        singlepageunscaled : 'Single page (unscaled)'
    },

    MultiPageExporter : {
        multipage     : 'Multiple pages',
        exportingPage : ({ currentPage, totalPages }) => `Exporting page ${currentPage}/${totalPages}`
    },

    MultiPageVerticalExporter : {
        multipagevertical : 'Multiple pages (vertical)',
        exportingPage     : ({ currentPage, totalPages }) => `Exporting page ${currentPage}/${totalPages}`
    },

    RowExpander : {
        loading            : 'Loading',
        expand             : 'Expand row details',
        collapse           : 'Collapse row details',
        columnDescription  : 'Toggle row details',
        expandedRowContent : 'Expanded row content'
    },

    TreeGroup : {
        group                  : 'Group by',
        stopGrouping           : 'Stop grouping',
        stopGroupingThisColumn : 'Ungroup column'
    },

    AIFilter : {
        unsuccessfulFilterMessage : 'Filter operation unsuccessful, please try again'
    },

    AIFilterField : {
        progressText : 'Filtering'
    },

    PinColumns : {
        pinColumn  : 'Pin column',
        unpin      : 'No pin',
        pinToStart : 'Pin to start',
        pinToEnd   : 'Pin to end'
    },

    ResourceInfoColumn : {
        eventCountText : data => data + ' event' + (data !== 1 ? 's' : '')
    },

    ResourceCollapseColumn : {
        toggleResourceLayout : 'Toggle resource layout column. SPACE for context menu.'
    },

    Dependencies : {
        from    : 'From',
        to      : 'To',
        valid   : 'Valid',
        invalid : 'Invalid'
    },

    DependencyType : {
        SS           : 'SS',
        SF           : 'SF',
        FS           : 'FS',
        FF           : 'FF',
        StartToStart : 'Start-to-Start',
        StartToEnd   : 'Start-to-Finish',
        EndToStart   : 'Finish-to-Start',
        EndToEnd     : 'Finish-to-Finish',
        short        : [
            'SS',
            'SF',
            'FS',
            'FF'
        ],
        long : {
            0 : 'Start-to-Start',
            1 : 'Start-to-Finish',
            2 : 'Finish-to-Start',
            3 : 'Finish-to-Finish'
        }
    },

    DependencyEdit : {
        From              : 'From',
        To                : 'To',
        Type              : 'Type',
        Lag               : 'Lag',
        'Edit dependency' : 'Edit dependency',
        Save              : 'Save',
        Delete            : 'Delete',
        Cancel            : 'Cancel',
        StartToStart      : 'Start to Start',
        StartToEnd        : 'Start to Finish',
        EndToStart        : 'Finish to Start',
        EndToEnd          : 'Finish to Finish',
        Active            : 'Active'
    },

    EventEdit : {
        Name           : 'Name',
        Resource       : 'Resource',
        Start          : 'Start',
        startTime      : 'Start time',
        End            : 'End',
        endTime        : 'End time',
        Save           : 'Save',
        Delete         : 'Delete',
        Cancel         : 'Cancel',
        'Edit event'   : 'Edit',
        Repeat         : 'Repeat',
        editRecurrence : 'Edit recurrence'
    },

    EventDrag : {
        eventOverlapsExisting   : 'Event overlaps existing event for this resource',
        noDropOutsideTimeline   : 'Event may not be dropped completely outside the timeline',
        duplicateAssignmentDrag : 'Event cannot be assigned to the same resource multiple times'
    },

    SchedulerBase : {
        'Add event'      : 'Add event',
        'Delete event'   : 'Delete',
        'Unassign event' : 'Unassign',
        color            : 'Color',
        eventAriaLabel   : (eventRecord, startDate) => `${eventRecord.name ?? ''}, starts at ${startDate} ${eventRecord.duration > 0 ? `for ${eventRecord.fullDuration.toString(false)}` : ''}`
    },

    TimeAxisHeaderMenu : {
        pickZoomLevel   : 'Zoom',
        activeDateRange : 'Date range',
        startText       : 'Start date',
        endText         : 'End date',
        todayText       : 'Today'
    },

    TimeAxisColumn : {
        ariaLabel : (startDate, endDate) => `Time axis showing ${startDate} to ${endDate}`
    },

    EventCopyPaste : {
        copyEvent  : 'Copy',
        cutEvent   : 'Cut',
        pasteEvent : 'Paste'
    },

    EventFilter : {
        filterEvents : 'Filter tasks',
        byName       : 'By name'
    },

    TimeRanges : {
        showCurrentTimeLine : 'Show current timeline'
    },

    PresetManager : {
        secondAndMinute : {
            displayDateFormat : 'll LTS',
            name              : 'Seconds'
        },
        minuteAndHour : {
            topDateFormat     : 'ddd MM/DD, hA',
            displayDateFormat : 'll LST'
        },
        hourAndDay : {
            topDateFormat     : 'ddd MM/DD',
            middleDateFormat  : 'LST',
            displayDateFormat : 'll LST',
            name              : 'Day'
        },
        day : {
            name : 'Day/hours'
        },
        week : {
            name : 'Week/hours'
        },
        dayAndWeek : {
            displayDateFormat : 'll LST',
            name              : 'Week/days'
        },
        dayAndMonth : {
            name : 'Month'
        },
        weekAndDay : {
            displayDateFormat : 'll LST',
            name              : 'Week'
        },
        weekAndMonth : {
            name : 'Weeks'
        },
        weekAndDayLetter : {
            name : 'Weeks/weekdays'
        },
        weekDateAndMonth : {
            name : 'Months/weeks'
        },
        monthAndYear : {
            name : 'Months'
        },
        year : {
            name : 'Years'
        },
        manyYears : {
            name : 'Multiple years'
        }
    },

    RecurrenceConfirmationPopup : {
        'delete-title'              : 'You are deleting an event',
        'delete-all-message'        : 'Do you want to delete all occurrences of this event?',
        'delete-further-message'    : 'Do you want to delete this and all future occurrences of this event, or only the selected occurrence?',
        'delete-only-this-message'  : 'Do you want to delete this occurrence of this event?',
        'delete-further-btn-text'   : 'Delete All Future Events',
        'delete-only-this-btn-text' : 'Delete Only This Event',
        'update-title'              : 'You are changing a repeating event',
        'update-all-message'        : 'Do you want to change all occurrences of this event?',
        'update-further-message'    : 'Do you want to change only this occurrence of the event, or this and all future occurrences?',
        'update-only-this-message'  : 'Do you want to change this occurrence of this event?',
        'update-further-btn-text'   : 'All Future Events',
        'update-only-this-btn-text' : 'Only This Event',
        Yes                         : 'Yes',
        Cancel                      : 'Cancel',
        width                       : 600
    },

    RecurrenceLegend : {
        ' and '                         : ' and ',
        Daily                           : 'Daily',
        'Weekly on {1}'                 : ({ days }) => `Weekly${days ? ` on ${days}` : ''}`,
        'Monthly on {1}'                : ({ days }) => `Monthly on ${days}`,
        'Yearly on {1} of {2}'          : ({ days, months }) => `Yearly on ${days} of ${months}`,
        'Every {0} days'                : ({ interval }) => `Every ${interval} days`,
        'Every {0} weeks on {1}'        : ({ interval, days }) => `Every ${interval} weeks on ${days}`,
        'Every {0} months on {1}'       : ({ interval, days }) => `Every ${interval} months on ${days}`,
        'Every {0} years on {1} of {2}' : ({ interval, days, months }) => `Every ${interval} years on ${days} of ${months}`,
        position1                       : 'the first',
        position2                       : 'the second',
        position3                       : 'the third',
        position4                       : 'the fourth',
        position5                       : 'the fifth',
        'position-1'                    : 'the last',
        day                             : 'day',
        weekday                         : 'weekday',
        'weekend day'                   : 'weekend day',
        daysFormat                      : ({ position, days }) => `${position} ${days}`
    },

    RecurrenceEditor : {
        'Repeat event'      : 'Repeat event',
        Cancel              : 'Cancel',
        Save                : 'Save',
        Frequency           : 'Frequency',
        Every               : 'Every',
        DAILYintervalUnit   : 'day(s)',
        WEEKLYintervalUnit  : 'week(s)',
        MONTHLYintervalUnit : 'month(s)',
        YEARLYintervalUnit  : 'year(s)',
        Each                : 'Each',
        on                  : 'On',
        the                 : 'The',
        'On the'            : 'On the',
        'End repeat'        : 'End repeat',
        'time(s)'           : 'time(s)',
        Days                : 'Days',
        Months              : 'Months'
    },

    RecurrenceDaysCombo : {
        day           : 'day',
        weekday       : 'weekday',
        'weekend day' : 'weekend day'
    },

    RecurrencePositionsCombo : {
        position1    : 'first',
        position2    : 'second',
        position3    : 'third',
        position4    : 'fourth',
        position5    : 'fifth',
        'position-1' : 'last'
    },

    RecurrenceStopConditionCombo : {
        Never     : 'Never',
        After     : 'After',
        'On date' : 'On date'
    },

    RecurrenceFrequencyCombo : {
        None    : 'No repeat',
        Daily   : 'Daily',
        Weekly  : 'Weekly',
        Monthly : 'Monthly',
        Yearly  : 'Yearly'
    },

    RecurrenceCombo : {
        None   : 'None',
        Custom : 'Custom...'
    },

    Summary : {
        'Summary for' : date => `Summary for ${date}`
    },

    ScheduleRangeCombo : {
        completeview : 'Complete schedule',
        currentview  : 'Visible schedule',
        daterange    : 'Date range',
        completedata : 'Complete schedule (for all events)'
    },

    SchedulerExportDialog : {
        'Schedule range' : 'Schedule range',
        'Export from'    : 'From',
        'Export to'      : 'To'
    },

    SinglePageExporterVertical : {
        verticalsinglepage : 'Single page'
    },

    SinglePageUnscaledExporterVertical : {
        verticalsinglepageunscaled : 'Single page (unscaled)'
    },

    MultiPageVerticalExporterVertical : {
        verticalmultipagevertical : 'Multiple pages (vertical)'
    },

    ExcelExporter : {
        'No resource assigned' : 'No resource assigned'
    },

    CrudManagerView : {
        serverResponseLabel : 'Server response:'
    },

    DurationColumn : {
        Duration : 'Duration'
    },

    RemoveDependencyCycleEffectResolution : {
        descriptionTpl : 'Remove dependency'
    },

    DeactivateDependencyCycleEffectResolution : {
        descriptionTpl : 'Deactivate dependency'
    },

    CycleEffectDescription : {
        descriptionTpl : 'A cycle has been found, formed by: {0}'
    },

    EmptyCalendarEffectDescription : {
        descriptionTpl               : '"{2}" task cannot be performed. "{0}" calendar does not provide any working time intervals.',
        forwardDescriptionTpl        : '"{2}" task cannot be performed. "{0}" calendar has no working time after {1}.',
        backwardDescriptionTpl       : '"{2}" task cannot be performed. "{0}" calendar has no working time before {1}.',
        noIntersectionDescriptionTpl : '"{2}" task cannot be performed. Its "{0}" calendar and its resource calendars have no common working time.'
    },

    Use24hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Use 24-hour calendar with non-working Saturdays and Sundays.'
    },

    Use8hrsEmptyCalendarEffectResolution : {
        descriptionTpl : 'Use 8-hour calendar (08:00-12:00, 13:00-17:00) with non-working Saturdays and Sundays.'
    },

    IgnoreProjectConstraintResolution : {
        descriptionTpl : 'Ignore the project border and proceed with the change.'
    },

    ProjectConstraintConflictEffectDescription : {
        startDescriptionTpl : 'You moved "{0}" task to start on {1}. This is before the project start date {2}.',
        endDescriptionTpl   : 'You moved "{0}" task to finish on {1}. This is after the project end date {2}.'
    },

    HonorProjectConstraintResolution : {
        descriptionTpl : 'Adjust the task to honor the project border.'
    },

    IgnoreResourceCalendarEmptyCalendarEffectResolution : {
        descriptionTpl : 'Ignore resource calendars and schedule the task using its own calendar only.'
    },

    ConflictEffectDescription : {
        descriptionTpl : 'A scheduling conflict has been found: {0} is conflicting with {1}'
    },

    ConstraintIntervalDescription : {
        dateFormat : 'LLL'
    },

    ProjectConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Project start date {0}',
        endDateDescriptionTpl   : 'Project end date {0}'
    },

    ManuallyScheduledParentConstraintIntervalDescription : {
        startDescriptionTpl : 'Manually scheduled "{2}" forces its children to start no earlier than {0}',
        endDescriptionTpl   : 'Manually scheduled "{2}" forces its children to finish no later than {1}'
    },

    DisableManuallyScheduledConflictResolution : {
        descriptionTpl : 'Disable manual scheduling for "{0}"'
    },

    DependencyConstraintIntervalDescription : {
        descriptionTpl : 'Dependency ({2}) from "{3}" to "{4}"'
    },

    RemoveDependencyResolution : {
        descriptionTpl : 'Remove dependency from "{1}" to "{2}"'
    },

    DeactivateDependencyResolution : {
        descriptionTpl : 'Deactivate dependency from "{1}" to "{2}"'
    },

    DateConstraintIntervalDescription : {
        startDateDescriptionTpl : 'Task "{2}" {3} {0} constraint',
        endDateDescriptionTpl   : 'Task "{2}" {3} {1} constraint',
        constraintTypeTpl       : {
            startnoearlierthan  : 'Start-No-Earlier-Than',
            finishnoearlierthan : 'Finish-No-Earlier-Than',
            muststarton         : 'Must-Start-On',
            mustfinishon        : 'Must-Finish-On',
            startnolaterthan    : 'Start-No-Later-Than',
            finishnolaterthan   : 'Finish-No-Later-Than'
        }
    },

    RemoveDateConstraintConflictResolution : {
        descriptionTpl : 'Remove "{1}" constraint of task "{0}"'
    },

    PostponeDateConstraintConflictResolution : {
        descriptionTpl : 'Postpone resolution and flag task "{0}" with conflict marker'
    },

    ConstraintTypePicker : {
        none                : 'None',
        assoonaspossible    : 'As soon as possible',
        aslateaspossible    : 'As late as possible',
        muststarton         : 'Must start on',
        mustfinishon        : 'Must finish on',
        startnoearlierthan  : 'Start no earlier than',
        startnolaterthan    : 'Start no later than',
        finishnoearlierthan : 'Finish no earlier than',
        finishnolaterthan   : 'Finish no later than'
    },

    EventBuffer : {
        preamblePostambleDescription : eventRecord => {
            let description = '';
            if (eventRecord.preamble) {
                description += `.${eventRecord.preamble.toString()} buffer time before the event`;
            }
            if (eventRecord.postamble) {
                description += `.${eventRecord.postamble.toString()} buffer time after the event`;
            }
            return description;
        }
    },

    SchedulingDirectionPicker : {
        Forward       : 'Forward',
        Backward      : 'Backward',
        inheritedFrom : 'Inherited from',
        enforcedBy    : 'Enforced by'
    },

    CalendarField : {
        'Default calendar' : 'Default calendar',
        editCalendar       : 'Edit calendar'
    },

    TaskEditorBase : {
        Information   : 'Task information',
        Save          : 'Save',
        Cancel        : 'Cancel',
        Delete        : 'Delete',
        calculateMask : 'Calculating...',
        saveError     : "Can't save, please correct errors first",
        repeatingInfo : 'Viewing a repeating event',
        editRepeating : 'Edit'
    },

    TaskEdit : {
        editEvent              : 'Edit',
        ConfirmDeletionTitle   : 'Confirm deletion',
        ConfirmDeletionMessage : 'Are you sure you want to delete the event?'
    },

    GanttTaskEditor : {
        editorWidth : '52em'
    },

    SchedulerTaskEditor : {
        editorWidth : '34em'
    },

    SchedulerGeneralTab : {
        General      : 'General',
        Name         : 'Name',
        Resources    : 'Resources',
        '% complete' : '% complete',
        Duration     : 'Duration',
        Start        : 'Start',
        Finish       : 'Finish',
        Effort       : 'Effort',
        Preamble     : 'Preamble',
        Postamble    : 'Postamble'
    },

    GeneralTab : {
        General      : 'General',
        Name         : 'Name',
        '% complete' : '% complete',
        Duration     : 'Duration',
        Start        : 'Start',
        Finish       : 'Finish',
        Effort       : 'Effort',
        Dates        : 'Dates'
    },

    SchedulerAdvancedTab : {
        Advanced                   : 'Advanced',
        Calendar                   : 'Calendar',
        'Scheduling mode'          : 'Scheduling mode',
        'Effort driven'            : 'Effort driven',
        'Manually scheduled'       : 'Manually scheduled',
        'Constraint type'          : 'Constraint type',
        'Constraint date'          : 'Constraint date',
        Inactive                   : 'Inactive',
        'Ignore resource calendar' : 'Ignore resource calendar'
    },

    CalendarEditorDatePicker : {
        addException : 'Add exception',
        addWeek      : 'Add week'
    },

    CalendarEditorExceptionTab : {
        addException    : 'Add exception',
        removeException : 'Remove exception',
        noRows          : 'No exceptions added'
    },

    CalendarEditorWeekTab : {
        addWeek    : 'Add week',
        removeWeek : 'Remove week'
    },

    CalendarEditor : {
        daysAreWorkingByDefault    : 'Days are working by default',
        workingTimeCalendar        : 'Working time calendar',
        exceptions                 : 'Exceptions',
        general                    : 'General',
        name                       : 'Name',
        parent                     : 'Parent',
        save                       : 'Save',
        weeks                      : 'Weeks',
        error                      : 'Error',
        inputErrors                : 'There are input errors. Please fix them before saving your changes.',
        delete                     : 'Delete',
        addCalendar                : 'Add a calendar',
        confirmation               : 'Confirmation',
        removeCalendarWithChildren : 'The calendar has child calendars. Click "Yes" to remove the calendar with its children.',
        removeCalendarAndLinks     : 'The calendar is used by some records. Click "Yes" to unlink them and remove the calendar.',
        newException               : 'New exception',
        newWeek                    : 'New week'
    },

    CalendarEditorDateInfo : {
        isWorking    : ' is working',
        isNotWorking : ' is not working',
        basedOn      : ' based on:',
        byDefault    : 'by default',
        rangeTpl     : (start, end) => `${start} to ${end}`
    },

    CalendarEditorLegend : {
        workingDay    : 'Working day',
        nonWorkingDay : 'Non-working day'
    },

    AvailabilityRangeError : {
        errorOverlap       : 'There are overlapping ranges',
        errorMissingDate   : 'Start and end time are required',
        errorStartAfterEnd : 'Start time cannot be after the end time'
    },

    CalendarEditorExceptionPanel : {
        name                                 : 'Name',
        from                                 : 'From',
        to                                   : 'To',
        is                                   : 'Is',
        nonWorking                           : 'Non-working',
        working                              : 'Working',
        hours                                : 'Hours',
        repeat                               : 'Repeat',
        repeatEnd                            : 'Repeat end',
        errorMissingDate                     : 'Exception date range is required',
        errorStartAfterEnd                   : '"From" date cannot be after the "To" date ',
        errorStartAndEndRepeatNumberMismatch : 'Exception should start and end the same number of times'
    },

    CalendarEditorWeekPanel : {
        name        : 'Name',
        from        : 'From',
        to          : 'To',
        days        : 'Days',
        copyDay     : 'Copy day',
        pasteDay    : 'Paste day',
        stopCopying : 'Stop copying'
    },

    CalendarEditorAvailabilityRangeContainer : {
        addRange    : 'Add range',
        removeRange : 'Remove range'
    },

    CalendarEditorWeekGrid : {
        errorStartAfterEnd           : '"From" date cannot be after the "To" date ',
        errorNoDefaultWeek           : 'Week configuration is required',
        errorMultipleDefaultWeeks    : 'More than one default week is specified',
        errorNoWeekAvailability      : 'Week must provide some working time',
        errorInvalidWeekAvailability : 'Week has working time configuration errors',
        noRows                       : 'No weeks added'
    },

    AdvancedTab : {
        Advanced                   : 'Advanced',
        Calendar                   : 'Calendar',
        'Scheduling mode'          : 'Scheduling mode',
        'Effort driven'            : 'Effort driven',
        'Manually scheduled'       : 'Manually scheduled',
        'Constraint type'          : 'Constraint type',
        'Constraint date'          : 'Constraint date',
        Constraint                 : 'Constraint',
        Rollup                     : 'Rollup',
        Inactive                   : 'Inactive',
        'Ignore resource calendar' : 'Ignore resource calendar',
        'Scheduling direction'     : 'Scheduling direction',
        projectBorder              : 'Project border',
        ignore                     : 'Ignore',
        honor                      : 'Honor',
        askUser                    : 'Ask user'
    },

    DependencyTab : {
        Predecessors      : 'Predecessors',
        Successors        : 'Successors',
        ID                : 'ID',
        Name              : 'Name',
        Type              : 'Type',
        Lag               : 'Lag',
        cyclicDependency  : 'Cyclic dependency',
        invalidDependency : 'Invalid dependency'
    },

    NotesTab : {
        Notes : 'Notes'
    },

    ResourceCalendarColumn : {
        calendar : 'Calendar'
    },

    ResourceEdit : {
        editResource : 'Edit resource'
    },

    ResourceEditor : {
        resourceInformation : 'Resource information',
        costs               : 'Costs',
        save                : 'Save',
        error               : 'Error',
        inputErrors         : 'There are input errors. Please fix them before saving your changes.',
        delete              : 'Delete',
        confirmation        : 'Confirmation',
        removeUsedResource  : 'The resource is assigned to some tasks. Click "Yes" to remove the resource anyway.'
    },

    ResourceEditorGeneralTab : {
        calendar    : 'Calendar',
        general     : 'General',
        label       : 'Material label',
        name        : 'Resource name',
        type        : 'Type',
        costAccrual : 'Cost accrual',
        labelHint   : 'for example, kg, tons or boxes',
        maxUnits    : 'Max units'
    },

    ResourceCostAccrualColumn : {
        accrueAt : 'Accrue at',
        prorated : 'Prorated',
        start    : 'Start',
        end      : 'End'
    },

    CostAccrualField : {
        prorated : 'Prorated',
        start    : 'Start',
        end      : 'End'
    },

    ResourceType : {
        work     : 'Work',
        material : 'Material',
        cost     : 'Cost'
    },

    ResourceTypeColumn : {
        type : 'Type'
    },

    ResourceEditorRateTablesTab : {
        rateTable    : 'Rate table',
        newGroup     : 'New table',
        removeGroup  : 'Remove table',
        useByDefault : 'Use by default for the resource assignments',
        noRates      : 'No rates'
    },

    ResourceGrid : {
        name          : 'Name',
        materialLabel : 'Material label',
        maxUnits      : 'Max units',
        cost          : 'Cost',
        noRows        : 'No resources'
    },

    ResourceRateTableContainer : {
        startDate    : 'Start date',
        standardRate : 'Standard rate',
        perUseCost   : 'Per use cost',
        addRate      : 'Add rate',
        removeRate   : 'Remove rate',
        name         : 'Name',
        noRates      : 'No rates'
    },

    ResourceRateTableEditor : {
        rateTableInformation : 'Rate table information'
    },

    ResourcesTab : {
        unitsTpl    : ({ column, value }) => column.formatValue(value) + '%',
        quantityTpl : ({ record, value }) => `${value || 0} ${record.resource?.materialLabel || ''}`,
        quantity    : 'Quantity',
        Resources   : 'Resources',
        Resource    : 'Resource',
        Units       : 'Units',
        cost        : 'Cost',
        effort      : 'Effort',
        start       : 'Start',
        finish      : 'Finish'
    },

    RateTableColumn : {
        rateTable : 'Rate table'
    },

    RecurrenceTab : {
        title : 'Repeat'
    },

    SchedulingModePicker : {
        Normal           : 'Normal',
        'Fixed Duration' : 'Fixed Duration',
        'Fixed Units'    : 'Fixed Units',
        'Fixed Effort'   : 'Fixed Effort'
    },

    ResourceHistogram : {
        barTipInRange         : '<b>{resource}</b> {startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
        barTipOnDate          : '<b>{resource}</b> on {startDate}<br><span class="{cls}">{allocated} of {available}</span> allocated',
        groupBarTipAssignment : '<b>{resource}</b> - <span class="{cls}">{allocated} of {available}</span>',
        groupBarTipInRange    : '{startDate} - {endDate}<br><span class="{cls}">{allocated} of {available}</span> allocated:<br>{assignments}',
        groupBarTipOnDate     : '<div class="b-tip-on-date">On {startDate}</div><div class="b-tip-allocated"><span class="{cls}">{allocated} of {available}</span> allocated:</div><div class="b-tip-assignments">{assignments}</div>',
        plusMore              : '+{value} more'
    },

    ResourceUtilization : {
        effortRangeInfo       : '<div class="b-effort-range-data"><div class="b-effort-label">Effort</div><div class="b-effort-value {cls}">{allocated} of {available}</div></div>',
        effortInfo            : '<div class="b-effort-data"><div class="b-effort-label">Effort</div><div class="b-effort-value {cls}">{allocated}</div></div>',
        costInfo              : '<div class="b-cost-data"><div class="b-effort-label">Cost</div><div class="b-effort-value b-cost">{cost}</div></div>',
        quantityInfo          : '<div class="b-quantity-data"><div class="b-effort-label">Quantity</div><div class="b-effort-value b-quantity">{quantity}</div></div>',
        barTipInRange         : '<div class="b-on-date">{event} {startDate} - {endDate}</div><div class="b-summary-data">{effort-info}{cost-info}{quantity-info}</div>',
        barTipOnDate          : '<div class="b-on-date">{event} on {startDate}</div><div class="b-summary-data">{effort-info}{cost-info}{quantity-info}</div>',
        groupBarTipAssignment : '<div class="b-assignment"><div class="b-assignment-name">{event}</div>{effort-info}{cost-info}{quantity-info}</div>',
        groupBarTipInRange    : '<div class="b-on-date">Summary for {startDate} - {endDate}</div><div class="b-summary-data">{effort-range-info}{cost-info}{quantity-info}</div><div class="b-assignments">{assignments}</div>',
        groupBarTipOnDate     : '<div class="b-on-date">Summary for {startDate}</div><div class="b-summary-data">{effort-range-info}{cost-info}{quantity-info}</div><div class="b-assignments">{assignments}</div>',
        plusMore              : '+{value} more',
        nameColumnText        : 'Resource / Event'
    },

    SchedulingIssueResolutionPopup : {
        'Cancel changes'   : 'Cancel the change and do nothing',
        schedulingConflict : 'Scheduling conflict',
        emptyCalendar      : 'Calendar configuration error',
        cycle              : 'Scheduling cycle',
        Apply              : 'Apply'
    },

    CycleResolutionPopup : {
        dependencyLabel        : 'Please select a dependency:',
        invalidDependencyLabel : 'There are invalid dependencies involved that need to be addressed:'
    },

    SchedulerProBase : {
        propagating     : 'Calculating project',
        storePopulation : 'Loading data',
        finalizing      : 'Finalizing results'
    },

    EventSegments : {
        splitEvent    : 'Split',
        renameSegment : 'Rename'
    },

    NestedEvents : {
        createGroup         : 'Group selected events',
        newGroupName        : 'New Group',
        deNestingNotAllowed : 'De-nesting not allowed',
        nestingNotAllowed   : 'Nesting not allowed'
    },

    VersionGrid : {
        compare       : 'Compare',
        description   : 'Description',
        occurredAt    : 'Occurred At',
        rename        : 'Rename',
        restore       : 'Restore',
        stopComparing : 'Stop Comparing'
    },

    Versions : {
        entityNames : {
            TaskModel       : 'task',
            AssignmentModel : 'assignment',
            DependencyModel : 'link',
            ProjectModel    : 'project',
            ResourceModel   : 'resource',
            other           : 'object'
        },
        entityNamesPlural : {
            TaskModel       : 'tasks',
            AssignmentModel : 'assignments',
            DependencyModel : 'links',
            ProjectModel    : 'projects',
            ResourceModel   : 'resources',
            other           : 'objects'
        },
        transactionDescriptions : {
            update : 'Changed {n} {entities}',
            add    : 'Added {n} {entities}',
            remove : 'Removed {n} {entities}',
            move   : 'Moved {n} {entities}',
            mixed  : 'Changed {n} {entities}'
        },
        addEntity         : 'Added {type} **{name}**',
        removeEntity      : 'Removed {type} **{name}**',
        updateEntity      : 'Changed {type} **{name}**',
        moveEntity        : 'Moved {type} **{name}** from {from} to {to}',
        addDependency     : 'Added link from **{from}** to **{to}**',
        removeDependency  : 'Removed link from **{from}** to **{to}**',
        updateDependency  : 'Edited link from **{from}** to **{to}**',
        addAssignment     : 'Assigned **{resource}** to **{event}**',
        removeAssignment  : 'Removed assignment of **{resource}** from **{event}**',
        updateAssignment  : 'Edited assignment of **{resource}** to **{event}**',
        noChanges         : 'No changes',
        nullValue         : 'none',
        versionDateFormat : 'M/D/YYYY h:mm a',
        undid             : 'Undid changes',
        redid             : 'Redid changes',
        editedTask        : 'Edited task properties',
        deletedTask       : 'Deleted a task',
        movedTask         : 'Moved a task',
        movedTasks        : 'Moved tasks'
    }
};

```


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>