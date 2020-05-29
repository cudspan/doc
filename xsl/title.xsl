<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" encoding="iso-8859-1" indent="yes"/>





<xsl:template match="/">
	<xsl:apply-templates />
</xsl:template>



<xsl:template match="*[@conref]">    
	  <xsl:element name="conrefWrapper">
	      <xsl:attribute name="reference"><xsl:value-of select="@conref"/></xsl:attribute>
	  </xsl:element>
</xsl:template>
	


<xsl:template match="topic/title">
  <xsl:param name="headinglevel">
  		<xsl:value-of select="count(ancestor::topic)"/>
  </xsl:param>
  <xsl:element name="h{$headinglevel}">
      <xsl:attribute name="class">topictitle<xsl:value-of select="$headinglevel"/></xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
      <xsl:value-of select="text()"/>
      <xsl:apply-templates/>
  </xsl:element>
</xsl:template>




<!-- ======================================== -->
<!-- Text Ranges... -->


<xsl:template match="b">
  <xsl:element name="b">
  	<xsl:apply-templates/>
  </xsl:element>
</xsl:template>

<xsl:template match="codeph">
  <xsl:element name="code">
  	<xsl:apply-templates/>
  </xsl:element>
</xsl:template>




<xsl:template match="text()">
	  <!-- This is what gets the text out there... -->
</xsl:template>


</xsl:stylesheet> 