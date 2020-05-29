<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:transform xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text"  indent="no"/>

    <xsl:param name="dv_vals"/>
    <xsl:param name="dv_attr"/>

    <xsl:template match="topic">
        <xsl:copy>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="topic/title"/>
    <xsl:template match="shortdesc"/>

    <xsl:template match="ph">
        <xsl:choose>
            <xsl:when test="@keyref">
                <xsl:text>#KEY_WORD:</xsl:text><xsl:value-of select="@keyref"/><xsl:text>#</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>&lt;ph&gt;</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>&lt;/ph&gt;</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="title">
        <xsl:text>CUD_OPENQUOTEtitleCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>CUD_CLOSEQUOTE, CUD_OPENQUOTEcontentCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
    </xsl:template>

    <xsl:template match="body">
            <xsl:text>[</xsl:text>
            <xsl:apply-templates/>
            <xsl:text>]</xsl:text>
    </xsl:template>

    <xsl:template match="section">
        <xsl:text>{</xsl:text>
        <xsl:for-each select='./data'>
            <xsl:text>CUD_OPENQUOTE</xsl:text>
            <xsl:value-of select='@name'/>
            <xsl:text>CUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
            <xsl:value-of select='@value'/>
            <xsl:text>CUD_CLOSEQUOTE, </xsl:text>
        </xsl:for-each>
        <xsl:apply-templates/>
        <xsl:text>CUD_CLOSEQUOTE}</xsl:text>
        <xsl:if test="./following-sibling::section"><xsl:text>,</xsl:text></xsl:if>
    </xsl:template>

    <!-- paragraphs -->
    <xsl:template match="p">
        <!-- To ensure XHTML validity, need to determine whether the DITA kids are block elements.
             If so, use div_class="p" instead of p -->
        <xsl:text>&lt;p </xsl:text>
        <xsl:text>&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/p&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="note">
        <xsl:text>&lt;hr/&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;hr/&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="ul">
        <xsl:text>&lt;ul&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/ul&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="ol">
        <xsl:text>&lt;ol&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/ol&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="li">
        <xsl:text>&lt;li&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/li&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="codeblock">
        <xsl:text>&lt;div class="codeblock"&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/codeblock&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="b">
        <xsl:text>&lt;strong&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/strong&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="i">
        <xsl:text>&lt;emphasis&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/emphasis&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="codeph">
        <xsl:text>&lt;code&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/code&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:choose>
            <xsl:when test="(ancestor::section) and (parent::title)">
                <xsl:value-of select="." />
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="." />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:transform>
