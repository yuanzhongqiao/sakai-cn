<%@ taglib uri="http://java.sun.com/jsf/html" prefix="h" %>
<%@ taglib uri="http://java.sun.com/jsf/core" prefix="f" %>
<%@ taglib uri="http://sakaiproject.org/jsf2/sakai" prefix="sakai" %>
<% response.setContentType("text/html; charset=UTF-8"); %>
<f:view>
<jsp:useBean id="msgs" class="org.sakaiproject.util.ResourceLoader" scope="session">
   <jsp:setProperty name="msgs" property="baseName" value="org.sakaiproject.tool.syllabus.bundle.Messages"/>
</jsp:useBean>

	<sakai:view_container title="#{msgs.title_edit}">
		<sakai:view_content>
			<script>includeLatestJQuery('edit_redirect.jsp');</script>
			<script>
				$(document).ready( function() {
					var menuLink = $('#syllabusMenuRedirectLink');
					menuLink.addClass('current');
					menuLink.find('a').removeAttr('href');
				});
			</script>
			<h:form id="redirectForm">
				<%@ include file="mainMenu.jsp" %>

				<div class="page-header">
					<h1><h:outputText value="#{msgs.redirect_sylla}" /></h1>
				</div>

				<h:messages styleClass="sak-banner-error" rendered="#{!empty facesContext.maximumSeverity}" />
				<h:panelGrid styleClass="jsfFormTable" columns="1">
					<h:panelGroup styleClass="instruction">
						<h:outputText value="#{msgs.redirect_sylla_delete}" />
					</h:panelGroup>
					<h:panelGroup styleClass="shorttext required">
						<h:panelGroup styleClass="syllabusLabel">
							<h:outputText value="*" styleClass="reqStar"/>
							<h:outputLabel for="urlValue"><h:outputText value="#{msgs.syllabus_url}"/></h:outputLabel>
						</h:panelGroup>
						<h:inputText id="urlValue" value="#{SyllabusTool.currentRediredUrl}" size="65"/>
					</h:panelGroup>
				</h:panelGrid>
				<sakai:button_bar>
					<h:commandButton
						styleClass="active"
						action="#{SyllabusTool.processEditSaveRedirect}"
						value="#{msgs.save}"
						accesskey="s" />
					<h:commandButton
						value="#{msgs.reset}"
						action="#{SyllabusTool.processEditResetRedirect()}"
						title="#{msgs.reset}"
						accesskey="r" />
					<h:commandButton
						action="#{SyllabusTool.processEditCancelRedirect}"
						value="#{msgs.cancel}" 
						accesskey="x" />
				</sakai:button_bar>

			</h:form>
		</sakai:view_content>
	</sakai:view_container>
</f:view>
