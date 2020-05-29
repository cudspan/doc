<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"  indent="no"/>

    <xsl:strip-space elements="*"/>


    <xsl:template match="/"><xsl:apply-templates  select="*"/></xsl:template>
    <xsl:template match="map">{<xsl:apply-templates/>}</xsl:template>

    <xsl:template match="data">
        <xsl:choose>
            <xsl:when test="./preceding-sibling::data"></xsl:when>
            <xsl:otherwise><xsl:text>"transform_params": {</xsl:text></xsl:otherwise>
        </xsl:choose>
        <xsl:text>"</xsl:text>
        <xsl:value-of select='@name'/>
        <xsl:text>" : "</xsl:text>
        <xsl:value-of select='normalize-space(.)'/><xsl:text>"</xsl:text>
        <xsl:choose>
            <xsl:when test="./following-sibling::data"><xsl:text>,</xsl:text></xsl:when>
            <xsl:otherwise><xsl:text>},</xsl:text></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="keydef">
        <xsl:choose>
            <xsl:when test="./preceding-sibling::keydef"></xsl:when>
            <xsl:otherwise><xsl:text>"kDataArray": [</xsl:text></xsl:otherwise>
        </xsl:choose>
        <xsl:text>{ "name" : "</xsl:text>
            <xsl:value-of select="@keys"/>",
            <xsl:apply-templates/>
        <xsl:text>}</xsl:text>
        <xsl:choose>
            <xsl:when test="./following-sibling::keydef"><xsl:text>,</xsl:text></xsl:when>
            <xsl:otherwise><xsl:text>]</xsl:text></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="topicmeta/keywords/keyword"> "val":
        <xsl:text>"</xsl:text>
        <xsl:value-of select="."/>
        <xsl:text>"</xsl:text>
    </xsl:template>

</xsl:stylesheet>
