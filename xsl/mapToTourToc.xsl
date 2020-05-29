<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:transform
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text"  indent="no"/>

    <xsl:template match="map">
        <xsl:copy>
            <xsl:text>[</xsl:text>
                <xsl:apply-templates/>
            <xsl:text>]</xsl:text>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="topicref">
        <xsl:text>{</xsl:text>
        <xsl:text>CUD_OPENQUOTEstepFileCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
        <!-- Strip leading '../' from the path if present. THis lets the map file -->
        <!-- work for print, and also in the context of the GUI app. -->
        <xsl:choose>
            <xsl:when test="substring-after(@href,'../')">
                <xsl:value-of select="substring-after(@href,'../')" />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select='@href'/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:text>CUD_CLOSEQUOTE,</xsl:text>

        <xsl:for-each select="./topicmeta/data">
            <xsl:text>CUD_OPENQUOTE</xsl:text>
            <xsl:value-of select='@name'/>
            <xsl:text>CUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
            <xsl:value-of select='@value'/>
            <xsl:text>CUD_CLOSEQUOTE, </xsl:text>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>

        <xsl:apply-templates/>

        <xsl:text>}</xsl:text>
        <xsl:if test="./following-sibling::topicref"><xsl:text>,</xsl:text></xsl:if>
        <xsl:text>&#10;</xsl:text>
        <xsl:text>&#10;</xsl:text>
    </xsl:template>

    <xsl:template match="navtitle">
        <xsl:text>CUD_OPENQUOTEdisplayNameCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
        <xsl:value-of select='.'/><xsl:text>CUD_CLOSEQUOTE</xsl:text>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:value-of select="." />
    </xsl:template>

</xsl:transform>
