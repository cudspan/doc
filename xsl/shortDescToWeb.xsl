<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:transform
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        version="1.0"
>
    <xsl:output method="html"  indent="no"/>



    <xsl:template match="@*|node()">
        <xsl:apply-templates select="@*|node()"/>
    </xsl:template>

    <xsl:template match="shortdesc">
        <xsl:copy>
        <xsl:value-of select="." />
        <xsl:apply-templates/>
    </xsl:copy>
</xsl:template>


</xsl:transform>