<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"  indent="no"/>
    
    <xsl:strip-space elements="*"/>
    <xsl:param name="dv_vals"/>
    <xsl:param name="dv_attr"/>
    
    <xsl:template match="/"><xsl:apply-templates  select="*"/></xsl:template>
    
    <xsl:template match="searchRoot"><xsl:text>{"searchData": [</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>]}</xsl:text>
    </xsl:template>
    
    <xsl:template match="searchRecord">
        <xsl:text>{"file" : "</xsl:text><xsl:value-of select="@file"/><xsl:text>","name" : "</xsl:text><xsl:value-of select="@name"/><xsl:text>",</xsl:text>
        <xsl:apply-templates/><xsl:text>}</xsl:text>
        <xsl:if test="./following-sibling::searchRecord"><xsl:text>,</xsl:text></xsl:if>
    </xsl:template>
    
    
    <xsl:template match="title">"title": {<xsl:apply-templates/>},</xsl:template>
    <xsl:template match="body">"body": {<xsl:apply-templates/>},</xsl:template>
    <xsl:template match="keywords">"keywords": {<xsl:apply-templates/>}</xsl:template>
    
    <xsl:template match="content">
        <xsl:if test="*">
            <xsl:apply-templates/>
            <xsl:if test="./following-sibling::content"><xsl:text>,</xsl:text></xsl:if>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="w">
        <xsl:text>"</xsl:text><xsl:value-of select="./@w"/><xsl:text>":"</xsl:text><xsl:value-of select="./@c"/><xsl:text>"</xsl:text>
        <xsl:if test="./following-sibling::w"><xsl:text>,</xsl:text></xsl:if>
    </xsl:template>
</xsl:stylesheet>
