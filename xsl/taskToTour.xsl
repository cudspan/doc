<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="1.0">

    <xsl:output method="text"  indent="no"/>

    <xsl:param name="dv_vals"/>
    <xsl:param name="dv_attr"/>

    <!-- Ignore these element -->
    <xsl:template match="*[data/@value = 'page']"/>

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
    


    <xsl:template match="topic">
        <xsl:copy>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="body">
        <xsl:text>[</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>]</xsl:text>
    </xsl:template>
    
    <xsl:template match="section">
        <xsl:choose>
            <xsl:when test="./data[@name='component' and @value='Overview']">
                    <xsl:text>{</xsl:text> <!-- Start the first tour object -->
                    <!-- Get the metadata -->
                    <xsl:for-each select="./data">
                        <xsl:text>CUD_OPENQUOTE</xsl:text>
                        <xsl:value-of select='@name'/>
                        <xsl:text>CUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
                        <xsl:value-of select='@value'/>
                        <xsl:text>CUD_CLOSEQUOTE, </xsl:text>
                    </xsl:for-each>
                    <!-- Now get title and content -->
                    <xsl:text>CUD_OPENQUOTEtitleCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
                    <xsl:value-of select='../../title'/>
                    <xsl:text>CUD_CLOSEQUOTE, CUD_OPENQUOTEcontentCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
                    <xsl:apply-templates/>
                    <!-- Finish this object. Assume it's followed by another! -->
                    <xsl:text>CUD_CLOSEQUOTE},</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="ol">
        <xsl:choose>
            <xsl:when test="../data[@name='component' and @value='Overview']">
                <xsl:text>&lt;ol&gt;</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>&lt;/ol&gt;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="ul/li">
        <xsl:text>&lt;li&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/li&gt;</xsl:text>
    </xsl:template>
    

    <xsl:template match="li">
        <xsl:choose>
            <xsl:when test="../../data[@name='component' and @value='Overview']">
                <xsl:text>&lt;li&gt;</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>&lt;/li&gt;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>{</xsl:text>
                <xsl:for-each select="./data">
                    <xsl:text>CUD_OPENQUOTE</xsl:text>
                    <xsl:value-of select='@name'/>
                    <xsl:text>CUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
                    <xsl:value-of select='@value'/>
                    <xsl:text>CUD_CLOSEQUOTE, </xsl:text>
                </xsl:for-each>
                <xsl:apply-templates/>
                <xsl:text>CUD_CLOSEQUOTE}</xsl:text>
                <xsl:if test="./following-sibling::li"><xsl:text>,</xsl:text></xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- Start tour object for a given OL item -->
    <!-- Top level ol in a section is the list of tour balloons. -->
    <xsl:template match="topic/body/section/ol/li/p[position()=1]">
        <xsl:text>CUD_OPENQUOTEtitleCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>CUD_CLOSEQUOTE, CUD_OPENQUOTEcontentCUD_CLOSEQUOTE : CUD_OPENQUOTE</xsl:text>
    </xsl:template>

    <!-- Standard transforms of content into HTML to display as tour obj content -->
    <xsl:template match="p">
        <!-- The first pgf in an ol/li has already been turned into a title prop in the JSON. -->
        <xsl:if test="not(topic/body/section/ol/li/p[position()=1])">
            <xsl:text>&lt;p&gt;</xsl:text>
            <xsl:apply-templates/>
            <xsl:text>&lt;/p&gt;</xsl:text>
        </xsl:if>
    </xsl:template>

    <xsl:template match="note">
        <xsl:text>&lt;hr/&gt;</xsl:text>
        <xsl:text>NOTE:&lt;b/&gt; </xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;hr/&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="ul">
        <xsl:text>&lt;ul&gt;</xsl:text>
        <xsl:apply-templates/>
        <xsl:text>&lt;/ul&gt;</xsl:text>
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
            <!-- Section titles are stored as a title property, not part of content -->
            <xsl:when test="(ancestor::section) and (parent::title)">
                <!-- Skip... do nothing... -->
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="." />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
