/**********************************************************************************
 * $URL: https://source.sakaiproject.org/svn/msgcntr/trunk/messageforums-api/src/java/org/sakaiproject/api/app/messageforums/ui/PrivateMessageManager.java $
 * $Id: PrivateMessageManager.java 9227 2006-05-15 15:02:42Z cwen@iupui.edu $
 ***********************************************************************************
 *
 * Copyright (c) 2003, 2004, 2005, 2006, 2007, 2008 The Sakai Foundation
 *
 * Licensed under the Educational Community License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **********************************************************************************/
package org.sakaiproject.api.app.messageforums.ui;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import org.sakaiproject.entity.api.Reference;
import org.sakaiproject.event.api.LearningResourceStoreService.LRS_Statement;
import org.sakaiproject.event.api.LearningResourceStoreService.LRS_Verb.SAKAI_VERB;
import org.sakaiproject.api.app.messageforums.Area;
import org.sakaiproject.api.app.messageforums.Attachment;
import org.sakaiproject.api.app.messageforums.DraftRecipient;
import org.sakaiproject.api.app.messageforums.MembershipItem;
import org.sakaiproject.api.app.messageforums.Message;
import org.sakaiproject.api.app.messageforums.MessageForumsMessageManager;
import org.sakaiproject.api.app.messageforums.PrivateForum;
import org.sakaiproject.api.app.messageforums.PrivateMessage;
import org.sakaiproject.api.app.messageforums.PrivateTopic;
import org.sakaiproject.api.app.messageforums.Topic;
import org.sakaiproject.user.api.User;

public interface PrivateMessageManager {
    
    public static String SORT_COLUMN_SUBJECT = "title";
    public static String SORT_COLUMN_AUTHOR = "author";
    public static String SORT_COLUMN_DATE = "message.created";
    public static String SORT_COLUMN_LABEL = "label";
    public static String SORT_COLUMN_TO = "message.recipientsAsText";
    public static String SORT_COLUMN_ATTACHMENT = "message.hasAttachments";
    
    public static String SORT_ASC = "asc";
    public static String SORT_DESC = "desc";
    
    public String getContextId();

    boolean isAllowToFieldMyGroupRoles(User user);

    public String getContextSiteId();
    
    public PrivateMessage initMessageWithAttachmentsAndRecipients(PrivateMessage msg);
    
    //public List getPvtMsgByIdWithAttachments(PrivateMessage msg);
    
    public void saveAreaAndForumSettings(Area area, PrivateForum forum);
    
    public void savePrivateMessageArea(Area area);
    
    public void saveForumSettings(PrivateForum forum);
    
    public void markMessageAsReadForUser(final PrivateMessage message);
    public void markMessageAsReadForUser(final PrivateMessage message, final String contextId);
    public void markMessageAsReadForUser(final PrivateMessage message, final String contextId, final String userId, String toolId);
    
    public void markMessageAsUnreadForUser(final PrivateMessage message);
    public void markMessageAsUnreadForUser(final PrivateMessage message, final String contextId);
    
    public void markMessageAsRepliedForUser(final PrivateMessage message);
    public void markMessageAsRepliedForUser(final PrivateMessage message, String userId);
    
    public List getMessagesByType(final String typeUuid, final String orderField,
        final String order);
    
    public List getMessagesByTypeByContext(final String typeUuid,
			final String contextId);
    public List getMessagesByTypeByContext(final String typeUuid, final String contextId, final String userId, final String orderField,
    	      final String order);


    /**
     * check if private message area is enabled for the current user
     * @return boolean
     */
    boolean isPrivateAreaEnabled();

    /**
     * retrieve private message area if it is enabled for the current user
     * @return area
     */
    Area getPrivateMessageArea();
    Area getPrivateMessageArea(String siteId);
    
    public PrivateForum initializePrivateMessageArea(Area area, List aggregateList, String userId, String siteId);
    
    public PrivateForum initializePrivateMessageArea(Area area, List aggregateList, String userId);  
    
    public PrivateForum initializePrivateMessageArea(Area area, List aggregateList);        
    
    public PrivateForum initializationHelper(PrivateForum forum, Area area);
    
    public PrivateForum initializationHelper(PrivateForum forum, Area area, String userId);
    
    /** 
     * create private message with type
     * @param typeUuid
     * @return private message
     */
    public PrivateMessage createPrivateMessage(String typeUuid);
    
    /**
     * send private message to recipients
     * @param message
     * @param recipients
     * @param asEmail
     * @param readReceipt
     */
    public void sendPrivateMessage(PrivateMessage message, Map<User, Boolean> recipients, boolean asEmail, boolean readReceipt);
    public void sendPrivateMessage(PrivateMessage message, Map<User, Boolean> recipients, boolean asEmail, List<MembershipItem> draftRecipients, List<MembershipItem> draftBccRecipients, boolean readReceipt);
    
    
    /**
     * mark message as deleted for user
     * @param message
     */
    public void deletePrivateMessage(PrivateMessage message, String typeUuid);

    /**
     * Save private message
     * @param message
     * @param recipients
     */
    Message savePrivateMessage(Message message);
    Message savePrivateMessage(Message message, boolean logEvent);
            
    /**
     * find message count for type
     * @param typeUuid
     * @param aggregateList
     * @return count
     */
    public int findMessageCount(String typeUuid, List aggregateList);
    
    /**
     * find unread message count for type
     * @param typeUuid
     * @param aggregateList
     * @return count
     */
    public int findUnreadMessageCount(String typeUuid, List aggregateList);
    
    public MessageForumsMessageManager getMessageManager();
    public Message getMessageById(Long messageId);
    
    public List getReceivedMessages(String orderField, String order);
    public List getSentMessages(String orderField, String order);
    public List getDeletedMessages(String orderField, String order);
    public List getDraftedMessages(String orderField, String order);    
    
    // will the below be helpful for displaying messages related to other mutable topics. 
    public List getMessagesByTopic(String userId, Long topicId);
    
    int getTotalNoMessages(Topic topic);
    int getUnreadNoMessages(Topic topic);    
    
    public List getPrivateMessageCountsForAllSites();
    
    //Topic Folder Setting
    public boolean isMutableTopicFolder(String parentTopicId);
    
    /** create a folder in Private forum    */
    public void createTopicFolderInForum(PrivateForum pf, String foderName);
    /** rename folder title     */
    public void renameTopicFolder(PrivateForum pf,String topicId, String newName);
    /**  Delete a topic from private forum   */
    public void deleteTopicFolder(PrivateForum pf, String topicId);
    /** Move the message under new topic */
    public void movePvtMsgTopic(PrivateMessage message,Topic oldTopic, Topic newTopic);
    /**  Get the Topic from uuid   
     * TODO - this can be replaced with another method which doesn't return messages*/
    public Topic getTopicByUuid(final String topicUuid);
    /** create Folder within Folder*/
    public void createTopicFolderInTopic(PrivateForum pf, PrivateTopic parentTopic, String folderName);
    
    
    //Attachment
    public void addAttachToPvtMsg(final PrivateMessage pvtMsgData, final Attachment pvtMsgAttach);
    public Attachment createPvtMsgAttachment(String attachId, String name);
    public void removePvtMsgAttachment(Attachment o);
    public Attachment getPvtMsgAttachment(final Long pvtMsgAttachId);
    
    
    public boolean isInstructor();
    public boolean isInstructor(User user, String contextId);
    public boolean isSectionTA();
    public boolean isSectionTA(User user, String contextId);
    public boolean isEmailPermit();
    
    public boolean isAllowToFieldGroups();

    boolean isAllowToFieldGroups(User user);

    public boolean isAllowToFieldAllParticipants();

    boolean isAllowToFieldAllParticipants(User user);

    public boolean isAllowToFieldRoles();

    boolean isAllowToFieldRoles(User user);

    public boolean isAllowToViewHiddenGroups();

    boolean isAllowToViewHiddenGroups(User user);

    public boolean isAllowToFieldUsers();

    boolean isAllowToFieldUsers(User user);

    public boolean isAllowToFieldMyGroups();

    boolean isAllowToFieldMyGroups(User user);

    public boolean isAllowToFieldMyGroupMembers();

    boolean isAllowToFieldMyGroupMembers(User user);

    public boolean isAllowToFieldMyGroupRoles();

    public PrivateMessage getNextMessage(PrivateMessage message);
    public PrivateMessage getPreviousMessage(PrivateMessage message);
    public boolean hasPreviousMessage(PrivateMessage message);
    public boolean hasNextMessage(PrivateMessage message);
    public PrivateMessage getPrivateMessage(final String id) throws MessagingException;
    public Map<User, Boolean> getRecipients(List recipients);
    public PrivateMessage getPvtMsgReplyMessage(PrivateMessage currentMessage, MimeMessage msg, StringBuilder[] bodyBuf, List<Reference> attachments, String from) throws MessagingException;
    public void processPvtMsgReplySentAction(PrivateMessage currentMessage, PrivateMessage rrepMsg);
    /** advanced search for private messages */ 
    public List searchPvtMsgs(String typeUuid, String searchText,Date searchFromDate, Date searchToDate, String selectedLabel, boolean searchByText, boolean searchByAuthor,boolean searchByBody, boolean searchByLabel,boolean searchByDate);
    public LRS_Statement getStatementForUserSentPvtMsg(String subject, SAKAI_VERB sakaiVerb, PrivateMessage rrepMsg);
    public String getEventMessage(Object object, String toolId, String userId, String contextId);
    public void sendProgamMessage(PrivateMessage message, List<MembershipItem> draftRecipients, List<MembershipItem> draftBccRecipients, boolean asEmail);

    boolean isAllowToFieldRoles(User user, String contextId);
	boolean isAllowToFieldMyGroupRoles(User user, String contextId);

	boolean isAllowToFieldAllParticipants(User user, String contextId);

	boolean isAllowToFieldGroups(User user, String contextId);

	boolean isAllowToViewHiddenGroups(User user, String contextId);

	boolean isAllowToFieldUsers(User user, String contextId);

	boolean isAllowToFieldMyGroups(User user, String contextId);

	boolean isAllowToFieldMyGroupMembers(User user, String contextId);

    public PrivateMessage getPrivateMessageByDecryptedId(String id) throws MessagingException;
    
}
