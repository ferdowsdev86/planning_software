<?php

namespace Bryntum\Util;

class ScriptEditor
{
    /**
     * Get a regular expression to match a region
     *
     * @param string $region The name of the region to match
     * @param string|null $startTag The start tag of the region (defaults to "-- region=$region")
     * @param string|null $endTag The end tag of the region (defaults to "-- endregion=$region")
     *
     * @return string The regular expression pattern
     */
    private static function getRegExp($region, $startTag = null, $endTag = null)
    {
        if (!$startTag) $startTag = "\s*--\s*region=$region";
        if (!$endTag) $endTag = "\s*--\s*endregion=$region";

        return "#$startTag(.*?)$endTag#s";
    }

    private static function matchTextRegion($text, $region, &$matches = null, $startTag = null, $endTag = null)
    {
        if (!$matches) $matches = [];

        $regexp = self::getRegExp($region, $startTag, $endTag);

        return preg_match($regexp, $text, $matches);
    }

    /**
     * Returns a region of the provided file.
     *
     * @param string $file File get a region from.
     * @param string $region Region name (by default the region will be searched as text between "-- region=$region" and  "-- endregion=$region" strings).
     * @param array|null  &$matches If provided will be fulfilled with internal preg_match call results.
     * @param string|null $startTag If provided, a string to be used to match the region start ("-- region=$region" by default).
     * @param string|null $endTag If provided, a string to be used to match the region start ("-- endregion=$region" by default).
     *
     * @return string Region text.
     */
    public static function getFileRegion($file, $region, &$matches = null, $startTag = null, $endTag = null)
    {
        if (!$matches) $matches = [];

        if (self::getTextRegion(file_get_contents($file), $region, $matches, $startTag, $endTag)) {
            return $matches[1];
        }
    }

    /**
     * Returns a region of the provided text.
     *
     * @param string $text     Text to get a region from.
     * @param string $region Region name (by default the region will be searched as text between "-- region=$region" and  "-- endregion=$region" strings).
     * @param array|null &$matches If provided will be fulfilled with internal preg_match call results
     * @param string|null $startTag If provided, a string to be used to match the region start ("-- region=$region" by default).
     * @param string|null $endTag If provided, a string to be used to match the region start ("-- endregion=$region" by default).
     *
     * @return string Region text.
     */
    public static function getTextRegion($text, $region, &$matches = null, $startTag = null, $endTag = null)
    {
        if (!$matches) $matches = [];

        if (self::matchTextRegion($text, $region, $matches)) {
            return $matches[1];
        }
    }

    /**
     * Replaces a region in the provided text.
     *
     * @param string $text        Text to search and replace a region.
     * @param string $region Region name (by default the region will be searched as text between "-- region=$region" and  "-- endregion=$region" strings).
     * @param string|null $replacement String to replace. Defaults to ''
     * @param string|null $startTag If provided, a string to be used to match the region start ("-- region=$region" by default).
     * @param string|null $endTag If provided, a string to be used to match the region start ("-- endregion=$region" by default).
     *
     * @return string New text.
     */
    public static function replaceTextRegion($text, $region, $replacement = '', $startTag = null, $endTag = null)
    {
        $regexp = self::getRegExp($region, $startTag, $endTag);

        return preg_replace($regexp, $replacement, $text);
    }
}
