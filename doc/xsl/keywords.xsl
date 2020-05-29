<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" encoding="iso-8859-1" indent="yes"/>





<xsl:template match="/">
	<xsl:apply-templates />
</xsl:template>


<xsl:template match="topic">
  <xsl:element name="h1">
      <xsl:attribute name="class">topic</xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
      <xsl:value-of select="@otherprops"/>
      <xsl:apply-templates/>
  </xsl:element>
</xsl:template>





<xsl:template match="text()">
	  <!-- This is what gets the text out there... -->
</xsl:template>


</xsl:stylesheet> 