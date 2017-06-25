<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:v="http://schemas.microsoft.com/visio/2003/SVGExtensions/"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns:def="http://www.w3.org/2000/svg"
	>
  
  <!-- rectify problem with visio arrows and firefox/chrome/opera -->

  <xsl:template match="def:marker" >
    <xsl:copy>
      <xsl:attribute name="style">overflow:visible</xsl:attribute>
      <xsl:apply-templates select ="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!--! workaround xml:space preserve in Visio export -->
  
  <xsl:template match="def:tspan[. = ' ']/text()">
    <xsl:text disable-output-escaping="yes"><![CDATA[&#xa0;]]></xsl:text>
  </xsl:template>

  <!-- remove visio data -->

  <xsl:template match="@v:*|v:*" />
  
  <xsl:template match="def:a">
      <xsl:apply-templates select="node()"/>
  </xsl:template>

  <!-- remove titles -->

  <xsl:template match="def:title" />

  <!-- copy the rest as is -->

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>
