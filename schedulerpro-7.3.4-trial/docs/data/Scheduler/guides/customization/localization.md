# Localization

## Introduction

Bryntum Scheduler uses locales for translating texts, date formats and such to different languages. This guide shows you 
how to use the supported locales in Bryntum Scheduler and how to create your own.

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

Bryntum Scheduler ships with the following locales:

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
* `PATH_TO_BUILD` targets the **build** source folder of the distribution zip or the **node_modules/@bryntum/scheduler**
  folder if npm packages were used.

Importing for JavaScript code compatible with ES modules can be done with

Import from source:

```javascript
import LocaleHelper from 'PATH_TO_LIB/Core/localization/LocaleHelper.js';
import LocaleManager from 'PATH_TO_LIB/Core/localization/LocaleManager.js';
```

or import from module bundle:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';
```

For UMD compatibility you may use this code:

HTML:

```html
<script src="PATH_TO_BUILD/scheduler.umd.js"></script>
```

JavaScript:

```javascript
const { LocaleManager } = window.bryntum.scheduler;
```

The code below shows import from module bundle for simplicity, but you may convert it to importing from umd or source if
you want.

## Publishing and applying locales

Bryntum Scheduler ships with two locale management classes [LocaleHelper](#Core/localization/LocaleHelper) and
[LocaleManager](#Core/localization/LocaleManager) which contain methods for publishing new and applying existing
locales.

The key methods and properties are:

[LocaleHelper.locales](#Core/localization/LocaleHelper#property-locales-static) - contains currently available locales.

[LocaleHelper.locale](#Core/localization/LocaleHelper#property-locale-static) - the currently active locale.

[LocaleHelper.publishLocale](#Core/localization/LocaleHelper#function-publishLocale-static) - used to publish locale 
which can be used later:

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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
import { LocaleManager } from 'PATH_TO_BUILD/scheduler.module.js';

LocaleManager.applyLocale('SvSE');
```

Simple assignment is also possible with [LocaleHelper.locale](#Core/localization/LocaleManager#property-locale)
property:

```javascript
import { LocaleManager } from 'PATH_TO_BUILD/scheduler.module.js';

LocaleManager.locale = 'SvSE';
```

## Enabling a locale with a script tag

Built locales are located in the `PATH_TO_BUILD/locales` folder. These locales are in UMD format and can be included on 
pages using normal script tags.

To include on a page using a `<script>` tag:

```html
<script src="PATH_TO_BUILD/locales/scheduler.locale.SvSE.js"></script>
```

By default, the first included locale is applied, but you can specify the `data-default-locale` attribute on any `<script>`
tag in your HTML page to set the one to use:

```html
<script data-default-locale="De" src="app.js"></script>
```

<div class="note">

The default English (US) locale is part of the Bryntum Scheduler bundle, you don't need to include it separately.

</div>

## Enabling locale with module imports

It is also possible to import locales directly from JavaScript code using the `import` statement.
This approach naturally works for frameworks such as Angular, React, Vue and others and is preferred whenever possible.

Locales would be imported at the beginning of the application code:

```javascript
import 'PATH_TO_BUILD/locales/scheduler.locale.SvSE.js';
```

<div class="note">

The default English locale is part of the Bryntum Scheduler bundle, you don't need to import it separately.

</div>

## Switching locale

You can also use `LocaleManager` from code to switch locale at any point:

```javascript
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';
// Import default locale SvSE first. This will also publish it
import 'PATH_TO_BUILD/locales/scheduler.locale.SvSE.js';

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
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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
import { LocaleManager, LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';
// Import default locale SvSE first. This will also publish it
import SvSELocale from 'PATH_TO_BUILD/locales/scheduler.locale.SvSE.js';

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
import { LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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
import { LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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

Bryntum Scheduler uses [ViewPreset](#Scheduler/preset/ViewPreset) to configure the timeaxis header and the date format
used by tooltips and similar. A `ViewPreset` defines the header rows displayed in the timeaxis header, from
one to three levels named bottom, middle and top. When creating a custom locale, you might want to change the date
format for these levels to suite your needs. This can be achieved by creating an entry for
[PresetManager](#Scheduler/preset/PresetManager) with sub entries per `ViewPreset`.

```javascript
import { LocaleHelper } from 'PATH_TO_BUILD/scheduler.module.js';

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

In case you want to localize date formats for the default zoom levels in Bryntum Scheduler, these are the ViewPresets
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

Note, a [weekStartDay](#Scheduler/view/TimelineBase#config-weekStartDay) value defined on the Bryntum Scheduler
instance overrides the value in the `DateHelper` localization.

## Recurrence legend

Please check the comments below for localizing recurrence legend values for Bryntum Scheduler:

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

The code below contains full localization for Bryntum Scheduler which can be used for creating new locales.

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
        long : [
            'Start-to-Start',
            'Start-to-Finish',
            'Finish-to-Start',
            'Finish-to-Finish'
        ]
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
        EndToEnd          : 'Finish to Finish'
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
    }
};

```


<p class="last-modified">Last modified on 2026-07-22 10:51:33</p>