<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="4.0" encoding="iso-8859-1" indent="yes"/>



<xsl:param name="topicPath"/>
<xsl:param name="topicNameParam"/>
<xsl:param name="shortFilename"/>
<xsl:param name="dv_vals"/>
<xsl:param name="dv_attr"/>
<xsl:param name="rootHtmlDoc"/>


  <xsl:template match="shortdescription">
  </xsl:template>

<xsl:template match="/">
	<xsl:apply-templates  select="*"/>
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
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
    
      <xsl:apply-templates/>
  </xsl:element>
</xsl:template>


<!-- TITLE for an image, in a figgroup... -->
<xsl:template match="figgroup/title">
  <xsl:element name="p">
      <xsl:attribute name="class">Figure</xsl:attribute>
      <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
      
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
      <xsl:apply-templates/>
  </xsl:element>
</xsl:template>



<xsl:template match="body" name="topic.body">
<div>
      <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
      
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    

  <xsl:apply-templates/>
</div>
</xsl:template>



<!-- paragraphs -->
<xsl:template match="p">
 <!-- To ensure XHTML validity, need to determine whether the DITA kids are block elements.
      If so, use div_class="p" instead of p -->
 <xsl:choose>
  <xsl:when test="descendant::pre or
       descendant::ul or
       descendant::sl or
       descendant::ol or
       descendant::lq or
       descendant::dl or
       descendant::note or
       descendant::lines or
       descendant::fig or
       descendant::table or
       descendant::simpletable">
     <div class="p">
     <!--
       <xsl:call-template name="setid"/>
       <xsl:apply-templates select="." mode="outputContentsWithFlagsAndStyle"/>
       -->
       <xsl:apply-templates/>
     </div>
     </xsl:when>
  <xsl:otherwise>
  <p>
  <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
    
	  <xsl:choose>
		  <xsl:when test="ancestor::li">
		  	<xsl:attribute name="class">Bullet-Continue</xsl:attribute>
		  </xsl:when>
	  </xsl:choose>
	  <xsl:choose>
		  <xsl:when test="ancestor::note">
		  <xsl:attribute name="class">Note</xsl:attribute>
		  	<b>NOTE: </b>
		  </xsl:when>
	  </xsl:choose>
  <!--
    <xsl:call-template name="setid"/>
    <xsl:apply-templates select="." mode="outputContentsWithFlagsAndStyle"/>
       <xsl:copy-of select="."/>
    <xsl:value-of select="."/>
    -->
    <!--
       <xsl:apply-templates mode="do_text"/>
       -->
       <xsl:apply-templates/>
  </p>
  </xsl:otherwise>
 </xsl:choose>
</xsl:template>



<xsl:template match="note">
 	<hr/>
<!--
 <p>
 	<xsl:attribute name="class">note</xsl:attribute>
 	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
 	<b>NOTE:</b><xsl:apply-templates/>
 </p>
 -->
 <xsl:apply-templates/>
 	<hr/>
</xsl:template>



<xsl:template match="ul">
 <ul>
 	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
   <xsl:apply-templates/>
 </ul>
</xsl:template>


<xsl:template match="ol">
 <ol>
 	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
   <xsl:apply-templates/>
 </ol>
</xsl:template>




<!-- list item -->
<xsl:template match="li">
  <xsl:element name="li">
  	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
  	<xsl:choose>
  	<xsl:when test="ancestor::ul">
  		<xsl:attribute name="class">Bulleted</xsl:attribute>
  	</xsl:when>
  	</xsl:choose>
  	<xsl:apply-templates/>
  </xsl:element>
</xsl:template>


<xsl:template match="codeblock">
<div class = "codeblock">
      <xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
  <xsl:element name="pre">
      <xsl:attribute name="id"><xsl:value-of select="../@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
      <xsl:apply-templates/>
  </xsl:element>
</div>
</xsl:template>



<!-- ======================================== -->
<!-- Tables... -->


<xsl:template match="table">

        <xsl:call-template name="dotable"/>
</xsl:template>


<xsl:template name="dotable">
 <table cellpadding="4" cellspacing="0" summary="">
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
      
  <xsl:variable name="colsep">
    <xsl:choose>
      <xsl:when test="@colsep"><xsl:value-of select="@colsep"/></xsl:when>
    </xsl:choose>
  </xsl:variable>
  <xsl:variable name="rowsep">
    <xsl:choose>
      <xsl:when test="@rowsep"><xsl:value-of select="@rowsep"/></xsl:when>
    </xsl:choose>
  </xsl:variable>
  
  <xsl:choose>
   <xsl:when test="@frame='all' and $colsep='0' and $rowsep='0'">
    <xsl:attribute name="border">0</xsl:attribute>
   </xsl:when>
   <xsl:when test="not(@frame) and $colsep='0' and $rowsep='0'">
    <xsl:attribute name="border">0</xsl:attribute>
   </xsl:when>
   <xsl:when test="@frame='sides'">
    <xsl:attribute name="frame">vsides</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:when>
   <xsl:when test="@frame='top'">
    <xsl:attribute name="frame">above</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:when>
   <xsl:when test="@frame='bottom'">
    <xsl:attribute name="frame">below</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:when>
   <xsl:when test="@frame='topbot'">
    <xsl:attribute name="frame">hsides</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:when>
   <xsl:when test="@frame='none'">
    <xsl:attribute name="frame">void</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:when>
   <xsl:otherwise>
    <xsl:attribute name="frame">border</xsl:attribute>
    <xsl:attribute name="border">1</xsl:attribute>
   </xsl:otherwise>
  </xsl:choose>
  <xsl:choose>
   <xsl:when test="@frame='all' and $colsep='0' and $rowsep='0'">
    <xsl:attribute name="border">0</xsl:attribute>
   </xsl:when>
   <xsl:when test="not(@frame) and $colsep='0' and $rowsep='0'">
    <xsl:attribute name="border">0</xsl:attribute>
   </xsl:when>
   <xsl:when test="$colsep='0' and $rowsep='0'">
    <xsl:attribute name="rules">none</xsl:attribute>
    <xsl:attribute name="border">0</xsl:attribute>
   </xsl:when>
   <xsl:when test="$colsep='0'">
    <xsl:attribute name="rules">rows</xsl:attribute>
   </xsl:when>
   <xsl:when test="$rowsep='0'">
    <xsl:attribute name="rules">cols</xsl:attribute>
   </xsl:when>
   <xsl:otherwise>
    <xsl:attribute name="rules">all</xsl:attribute>
   </xsl:otherwise>
  </xsl:choose>
  <!-- title and desc are processed elsewhere -->
  <xsl:apply-templates select="tgroup"/>
  </table>
  
  
</xsl:template>



<xsl:template match="tgroup" name="topic.tgroup">
 <xsl:apply-templates/>
</xsl:template>




<xsl:template match="thead" name="topic.thead">
  <thead>
    <!--
    -->
    <xsl:choose>
     <xsl:when test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
     </xsl:when>
     <xsl:otherwise>
      <xsl:call-template name="th-align"/>
     </xsl:otherwise>
    </xsl:choose>
    <!--
    -->
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:apply-templates/>
  </thead>
</xsl:template>


<xsl:template match="tbody" name="topic.tbody">
  <tbody>
  <!--
    -->
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:apply-templates/>
    <!-- process table footer -->
  </tbody>
</xsl:template>


<xsl:template match="row" name="topic.row">
  <tr>
    <xsl:if test="@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="@audience"/>
      </xsl:attribute>
    </xsl:if>
    
  <!--
    -->
    <xsl:if test="@align">
      <xsl:attribute name="align">
        <xsl:value-of select="@align"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@char">
      <xsl:attribute name="char">
        <xsl:value-of select="@char"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@charoff">
      <xsl:attribute name="charoff">
        <xsl:value-of select="@charoff"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@valign">
      <xsl:attribute name="valign">
        <xsl:value-of select="@valign"/>
      </xsl:attribute>
    </xsl:if>
    <xsl:apply-templates/>
  </tr>
</xsl:template>


<xsl:template match="entry" name="topic.entry">
    <xsl:if test="@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="@audience"/>
      </xsl:attribute>
    </xsl:if>
    
<!--
  -->
  <xsl:choose>
      <xsl:when test="parent::*/parent::thead">
          <xsl:call-template name="topic.thead_entry"/>
      </xsl:when>
      <xsl:otherwise>
          <xsl:call-template name="topic.tbody_entry"/>
      </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<!-- do header entries -->
<xsl:template name="topic.thead_entry">
 <th>
    <xsl:if test="@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="@audience"/>
      </xsl:attribute>
    </xsl:if>
    
 <!--
  -->
  <xsl:variable name="span_size">
    <xsl:call-template name="find-entry-span"/>
  </xsl:variable>
  <xsl:attribute name="colspan"><xsl:value-of select="$span_size"/></xsl:attribute>
  <xsl:call-template name="doentry"/>
 </th>
</xsl:template>

<!-- do body entries -->
<xsl:template name="topic.tbody_entry">
<!--
  -->
<td>
    <xsl:if test="@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="@audience"/>
      </xsl:attribute>
    </xsl:if>
    
<!--
  -->
  <xsl:variable name="span_size">
    <xsl:call-template name="find-entry-span"/>
  </xsl:variable>
  <xsl:attribute name="colspan"><xsl:value-of select="$span_size"/></xsl:attribute>
  <xsl:call-template name="doentry"/>
</td>
</xsl:template>




<xsl:template name="doentry">
  <xsl:choose>
    <!-- When entry is empty, output a blank -->
    <xsl:when test="not(*|text()|processing-instruction())">
      <xsl:text>&#160;</xsl:text>  <!-- nbsp -->
    </xsl:when>
    <xsl:otherwise>
          <xsl:apply-templates/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>


<xsl:template name="find-entry-span">

  <xsl:variable name="startpos">
    <xsl:call-template name="find-entry-start-position"/>
  </xsl:variable>
  <xsl:variable name="endpos">
    <xsl:call-template name="find-entry-end-position"/>
  </xsl:variable>
  <xsl:value-of select="($endpos - $startpos) + 1"/>
  <!--
  <xsl:when test="$startpos &lt; $endpos">
  	<xsl:value-of select="($endpos - $startpos) + 1"/>
  </xsl:when>
  <otherwise><xsl:value-of select="1"/></otherwise>
  -->
  <!-- If endpos is > startpos, get the diff plus one... -->
  
  
</xsl:template>

<!-- Find the starting column of an entry in a row. -->
<xsl:template name="find-entry-start-position">
  <xsl:choose>

    <!-- if the column number is specified, use it -->
    <xsl:when test="@colnum">
      <xsl:value-of select="@colnum"/>
    </xsl:when>

    <!-- If there is a defined column name, check the colspans to determine position -->
    <xsl:when test="@colname">
      <!-- count the number of colspans before the one this entry references, plus one -->
      <!--
      <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@colname]/preceding-sibling::*)+1)"/>
      -->
      <xsl:value-of select="number(count(../../../colspec[@colname=current()/@colname]/preceding-sibling::*)+1)"/>
    </xsl:when>

    <!-- If the starting column is defined, check colspans to determine position -->
    <xsl:when test="@namest">
    <!--
      <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@namest]/preceding-sibling::*)+1)"/>
      -->
      <xsl:value-of select="number(count(../../../colspec[@colname=current()/@namest]/preceding-sibling::*)+1)"/>
    </xsl:when>

    <!-- Need a test for spanspec -->
    <xsl:when test="@spanname">
      <xsl:variable name="startspan">  <!-- starting column for this span -->
      <!--
        <xsl:value-of select="../../../*[contains(@class,' topic/spanspec ')][@spanname=current()/@spanname]/@namest"/>
        -->
        <xsl:value-of select="../../../spanspec[@spanname=current()/@spanname]/@namest"/>
      </xsl:variable>
      <!--
      <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=$startspan]/preceding-sibling::*)+1)"/>
      -->
      <xsl:value-of select="number(count(../../../colspec[@colname=$startspan]/preceding-sibling::*)+1)"/>
    </xsl:when>

    <!-- Otherwise, just use the count of cells in this row -->
    <xsl:otherwise>
      <xsl:variable name="prev-sib">
        <xsl:value-of select="count(preceding-sibling::*)"/>
      </xsl:variable>
      <xsl:value-of select="$prev-sib+1"/>
    </xsl:otherwise>

  </xsl:choose>
</xsl:template>

<!-- Find the end column of a cell. If the cell does not span any columns,
     the end position is the same as the start position. -->
<xsl:template name="find-entry-end-position">
  <xsl:param name="startposition" select="0"/>
  <xsl:choose>
    <xsl:when test="@nameend">
    <!--
      <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=current()/@nameend]/preceding-sibling::*)+1)"/>
      -->
      <xsl:value-of select="number(count(../../../colspec[@colname=current()/@nameend]/preceding-sibling::*)+1)"/>
    </xsl:when>
    <xsl:when test="@spanname">
      <xsl:variable name="endspan">  <!-- starting column for this span -->
      <!--
        <xsl:value-of select="../../../*[contains(@class,' topic/spanspec ')][@spanname=current()/@spanname]/@nameend"/>
        -->
        <xsl:value-of select="../../../spanspec[@spanname=current()/@spanname]/@nameend"/>
      </xsl:variable>
      <!--
      <xsl:value-of select="number(count(../../../*[contains(@class,' topic/colspec ')][@colname=$endspan]/preceding-sibling::*)+1)"/>
      -->
      <xsl:value-of select="number(count(../../../colspec[@colname=$endspan]/preceding-sibling::*)+1)"/>
    </xsl:when>
    <xsl:otherwise>
      <xsl:value-of select="$startposition"/>
    </xsl:otherwise>
  </xsl:choose>
</xsl:template>




<!-- For simple table headers: <TH> Set align="right" when in a BIDI area -->
<xsl:template name="th-align">
   <xsl:attribute name="align">left</xsl:attribute>
</xsl:template>





<xsl:template match="text()">
  <!-- Delete the given condition... -->
  <!--
  <xsl:choose> 
	  <xsl:when test="((preceding-sibling::processing-instruction()[1]) and (starts-with(preceding-sibling::processing-instruction('Fm')[1], 'Condstart')))">
		  <xsl:variable name="condName">
		  	<xsl:value-of select="normalize-space(substring-after(preceding-sibling::processing-instruction('Fm')[1], 'Condstart'))" />
		  </xsl:variable>
		  <xsl:if test="$condName != 'Deleted' and $condName != 'PrintOnly' and $condName != 'Hidden' "><xsl:value-of select="." /></xsl:if>
	  </xsl:when>
	  <xsl:otherwise>
	  	<xsl:value-of select="." /> 
	  </xsl:otherwise>
  </xsl:choose>
	  -->
	  <!-- This is what gets the text out there... -->
  <xsl:value-of select="." /> 
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




<!-- ================================================== -->
<!-- Images and other objects... -->


<xsl:template match="xref">


  <xsl:variable name="hrefStr" select="@href"/>
  <xsl:variable name="externalFunctionStr">
  <xsl:value-of select="$rootHtmlDoc" />#topic=<xsl:value-of select="$topicNameParam"/><xsl:value-of select="@href"/>
  
  </xsl:variable>
  <xsl:variable name="internalFunctionStr"> 
  <xsl:value-of select="$rootHtmlDoc" />#topic=<xsl:value-of select="$topicNameParam"/><xsl:value-of select="$shortFilename"/>&amp;hash=<xsl:value-of select="translate(@href, '\#', '')"/>
  </xsl:variable>
  
  <xsl:element name="a">
  	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
  	
	  <xsl:choose>
		<xsl:when test="contains($hrefStr, 'xml')">
			<xsl:attribute name="href"><xsl:value-of select="$externalFunctionStr"/></xsl:attribute>
		</xsl:when>
		<xsl:otherwise>
			<xsl:attribute name="href"><xsl:value-of select="$internalFunctionStr"/></xsl:attribute>
		</xsl:otherwise>
	  </xsl:choose>
	  
  	<xsl:apply-templates/>
  </xsl:element>
</xsl:template>




<xsl:template match="image">
		<xsl:variable name="temp"><xsl:value-of select="@href"/></xsl:variable>
	  <xsl:element name="img_bogus">
  <xsl:choose>
    <xsl:when test="../@audience">
      <xsl:attribute name="audience">
        <xsl:value-of select="../@audience"/>
      </xsl:attribute>
    </xsl:when>
    <xsl:otherwise>
	    <xsl:if test="@audience">
	      <xsl:attribute name="audience">
	        <xsl:value-of select="@audience"/>
	      </xsl:attribute>
	    </xsl:if>
    </xsl:otherwise>
  </xsl:choose>
    
	  	<xsl:attribute name="alt">image</xsl:attribute>
	  	<xsl:attribute name="height"><xsl:value-of select="@height"/></xsl:attribute>
	  	<xsl:attribute name="width"><xsl:value-of select="@width"/></xsl:attribute>
	  	<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:choose> 
			<xsl:when test="starts-with($temp,'../')">
				<xsl:attribute name="src"><xsl:value-of select="substring-after($temp, '../')"/></xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="src"><xsl:value-of select="$temp"/></xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	  </xsl:element>
</xsl:template>





</xsl:stylesheet> 