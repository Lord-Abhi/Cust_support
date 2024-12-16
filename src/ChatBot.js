// src/ChatBot.js
import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';

const api_url = 'https://api.openai.com/v1/chat/completions';
const api_method = 'POST';
const api_content_type = 'application/json';
const api_auth_key = "Bearer "+process.env.REACT_APP_OPENAI_API_KEY;
const api_model = 'gpt-4o-mini';

let initial_execution = true;
var is_closing = false;


AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_LEX_CLIENTID,
  secretAccessKey: process.env.REACT_APP_AWS_LEX_SECRETKEY,
  region: process.env.REACT_APP_AWS_LEX_REGION
});

const comprehend = new AWS.Comprehend();

var pdf_content = `If you are experiencing issues with Microsoft Office programs, such as Outlook getting stuck on the "Loading Profile" screen, Excel not responding, or Outlook freezing, these problems can often be resolved by repairing the Office suite. Follow these steps to repair Microsoft Office and restore its functionality.  

First, ensure that all Microsoft Office applications, such as Word, Excel, or Outlook, are closed. Having these programs open during the repair process can interfere with the repair. Next, open the Control Panel. You can do this by pressing the Windows key and typing "Control Panel" in the search bar, then pressing Enter.  

Once the Control Panel is open, navigate to the "Programs and Features" section. In the list of installed programs, locate "Microsoft 365 Apps for Enterprise" or your version of Microsoft Office. Right-click on the program name and select "Change" from the context menu. This will open a new window with repair options.  

In the repair window, select the "Quick Repair" option. This is a faster method that fixes most common issues without requiring an internet connection. Follow the on-screen instructions to complete the repair process.  

After the repair is complete, restart your computer. This step is essential to ensure that all changes take effect. Once your computer has restarted, open your Microsoft Office programs to confirm they are working correctly. The repair process should resolve the issues and restore the performance of your Office applications.`
// var pdf_content = `

// Microsoft Teams Troubleshooting Guide

// 1. Login Issues
// Ensure Correct Credentials: Double-check your Microsoft account credentials (username and password).
// Clear Cache and Cookies: If logging in via the web app, clear your browser's cache and cookies or try an incognito window.
// Update the App: Make sure your Microsoft Teams app is up-to-date, as login issues can sometimes be due to outdated versions.
// Check Connectivity: Ensure a stable internet connection. If you're using a VPN, try disconnecting it temporarily.
// Reset Password: If you still can't log in, you may need to reset your Microsoft password or contact your IT administrator for assistance.

// 2. Notifications Not Appearing in Activity
// Review Notification Settings: Go to your profile picture in the upper-right corner > Settings > Notifications. Adjust settings for channels, messages, and mentions as needed.
// Check Channel Notifications: For specific Teams channels, ensure notifications are enabled. Go to the channel > click the 'More options' (three dots) > Channel notifications.
// Allow Notifications on Device Settings: For mobile app users, check that Teams notifications are allowed in your device’s notification settings.

// 3. Chat or Message Delivery Delays
// Check Internet Connection: A weak or unstable connection can delay message delivery.
// Sign Out and Back In: This can refresh your connection to Teams and resolve delays.
// Clear Teams Cache: For desktop, close Teams, navigate to %appdata%\Microsoft\Teams in File Explorer, and delete the Cache folder.
// Update App: Ensure you are using the latest version of Microsoft Teams.

// 4. Meeting Issues (Audio/Video Problems)
// Test Device Settings: In Teams, go to Settings > Devices to test and select your preferred microphone, speakers, and camera.
// Allow Permissions: Check your computer or browser permissions to ensure Teams can access your camera and microphone.
// Use a Headset: Using a headset with a built-in microphone often improves audio quality.
// Turn Off Background Apps: Close any other apps that may be using the microphone or camera.

// 5. Screen Sharing Not Working
// Check Permissions: If using the desktop app, ensure that screen-sharing permissions are allowed in your system settings (especially for macOS users).
// Rejoin the Meeting: Leave and rejoin the meeting, as this can sometimes reset sharing capabilities.
// Try Different Content Sharing Options: In the Teams meeting, choose between sharing a specific window, the full screen, or an individual app to see if one works over another.

// 6. File Sharing or Document Collaboration Issues
// Check File Permissions: Ensure you have permission to share or edit files in that specific Team or channel.
// Sign Out and Back In: This can resolve access issues to shared files and sync problems.
// Try a Different Browser: For browser users, try switching to Edge or Chrome for better compatibility with Office 365 integrations.
// Ensure Files Are Synced in OneDrive: If files are stored in OneDrive, ensure they’re synced properly. Open OneDrive to verify.

// 7. Calendar Not Syncing or Issues Scheduling Meetings
// Check Outlook Integration: Ensure your Microsoft account is correctly synced with Outlook, as Teams relies on this for calendar integration.
// Update Teams and Outlook: Make sure both applications are updated.
// Re-authenticate Your Account: Sign out and sign back in to refresh the connection to your calendar.

// 8. Integration Issues with Other Apps (e.g., Planner, Trello)
// Check App Permissions: Ensure Microsoft Teams has permission to integrate with the app you are trying to use.
// Update the Integrated App: Sometimes, the app itself needs updating for integrations to work smoothly.
// Remove and Re-add the App: Go to the Apps tab in Teams, uninstall the app, and then reinstall it to reset the integration.

// 9. Customizing Settings and Preferences Not Saving
// Clear Cache: Cached data can sometimes interfere with saved settings. Clear Teams cache (see Step 3) and try again.
// Reinstall Teams: If settings are still not saving, try uninstalling and reinstalling Teams.
// Check for Admin Restrictions: Some settings might be restricted by your organization’s IT policies.

// 10. Synchronization Across Devices Not Working
// Verify Internet Connection on All Devices: A weak connection on one device may cause desynchronization.
// Sign Out and Back In on All Devices: Log out of Teams on each device and log back in to resync data.
// Update Teams on All Devices: Ensure all devices are using the latest version of Microsoft Teams.
// `;

const ChatBot = ({isVoiceTest, testAreaValue}) => {
  if(isVoiceTest){
    document.getElementById("txt_msg")?.setAttribute("disabled", "disabled");
  }
  const [input, setInput] = useState('');
  const [AverageHandleTime, setAvarageHandleTime] = useState('');
  const [AverageResponseTime, setAverageResponseTime] = useState('');
  const [messages, setMessages] = useState([]);
  const [typeSpeed, setTypeSpeed] = useState([]);
  const [averageTypeSpeed, setAverageTypeSpeed] = useState([]);
  const [averageSentimentScore, setAverageSentimentScore] = useState([]);
  const [startTypeTime, setStartTypeTime] = useState('');

  const [prompt, setPrompt] = useState(" Based on the content crate a simple outlook get stucked issue and simulate a call with a knowledgeable and assertive customer. The customer should be confident, direct, and detail-oriented, expecting quick and accurate answers, provide personal information if needed, do not make the chat complicate and close the chat within few steps. The issue must get solved once the computer is gone through quick repair, restarted and reopened outlook. Provide only the customer’s responses, keeping them concise and do not as for assistance.");

  const changeOption = (event) => {
    //console.log(event.target.value)
    //setPrompt("just message");
    switch(event.target.value){
      case 'angry':
        setPrompt(" Based on the content simulate a call with an angry customer expressing direct frustration about a product and the service experience. The customer should be assertive and clearly unhappy with both the product's performance and the difficulty in receiving help. The call should lead to a resolution, ending on a positive note. Provide only the customer’s responses, keeping them concise. dont't make conversation lengthy.")
        break;
      case 'confused':
        setPrompt(" Based on the content simulate a call with a confused customer who is unsure about how to use the product and feels uncertain about the guidance they've received so far. The customer should express hesitation, ask multiple questions, and need reassurance. The call should lead to a clear understanding and a confident, positive conclusion. Provide only the customer’s responses, keeping them brief.");
        break;
      case 'silent':
        setPrompt(" Based on the content simulate a call with a silent or reserved customer who is dissatisfied with a product and the service experience. The customer should be reluctant to share details, giving brief and minimal responses that indicate frustration with both the product's performance and the lack of support. The conversation should gradually lead to a resolution, ending on a positive note. Provide only the customer’s responses, keeping them brief.")
        break;
      case 'assertive':
        //setPrompt(" Based on the content crate a simple password expire case and simulate a call with a knowledgeable and assertive customer who expresses clear dissatisfaction with the product’s performance and challenges in obtaining support. The customer should be confident, direct, and detail-oriented, expecting quick and accurate answers, provide personal information if needed and keep the chat short. The chat should progress toward a satisfactory resolution after reciving the temp password and conclude positively and close the chat. Provide only the customer’s responses, keeping them concise.")
        setPrompt(" Based on the content crate a simple password expire case and simulate a call with a knowledgeable and assertive customer. The customer should be confident, direct, and detail-oriented, expecting quick and accurate answers, provide personal information if needed, do not make the chat complicate and close the chat within few steps. The chat should progress toward a satisfactory resolution after reciving the temp password. Provide only the customer’s responses, keeping them concise.")
        break;
      case 'priceConsious':
        setPrompt(" Based on the content simulate a call with a price-conscious customer who is frustrated about the product’s value for money and the lack of satisfactory service. The customer should be assertive, expressing disappointment over the product’s cost and asking about discounts or compensation. The call should conclude with a resolution that addresses their concerns and offers them a sense of value. Provide only the customer’s responses, keeping them brief and direct.")
        break;
      case 'escalationProne':
        setPrompt(" Based on the content simulate a call with an escalation-prone customer who is clearly dissatisfied with the product and service experience. The customer should be assertive, quickly requesting to speak to a supervisor due to frustration with the product's performance and previous support attempts. The conversation should eventually lead to a resolution, ending on a positive note. Provide only the customer’s responses, keeping them concise.")
        break;
    }
    setMessages([]);
  };

  const checkForClosure = async () =>{
    const userMessage = { role: 'system', content: "Did this chat reached to a conclusion or resolution state? Respond only in Yes/No." };
    try {
      // Use the fetch API to send a request to OpenAI
      const response = await fetch(api_url, {
        method: api_method,
        headers: {'Content-Type': api_content_type, Authorization: api_auth_key,
        },
        body: JSON.stringify({
          model: api_model,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the bot's response to the chat
        //console.log("checkForClosure response: ", data.choices[0].message.content)
        return data.choices[0].message.content;
      } else {
        console.error('Error:', data);
        return "error";
      }
    } catch (error) {
      console.error('Error communicating with OpenAI API:', error);
    }
  }

  const sendMessage = async () => {
    //calculate the typing speed per second for each user response
    if(startTypeTime!=''){
      let current_time = new Date();
      //console.log('current time: ', current_time, "start time:", startTypeTime)
      let time_diff = current_time - startTypeTime;
      //console.log('time diffrence: ', time_diff, "in min: ",(time_diff/60000));
      let word_count = input.trim().split(' ').length;
      //console.log('word_count: ', word_count)
      let words_per_sec = (word_count/(time_diff/60000)).toFixed(1);
      //console.log('words_per_sec: ', words_per_sec)
      setTypeSpeed((oldRec)=>[...oldRec, words_per_sec])
    }    
    
    const sysMessage = { role: 'system', content: pdf_content + prompt};
    //console.log("is_closing: ", is_closing);
    
    //console.log("message length: ",messages.length)
    let userMessage = {};
    if(messages.length==0){
      userMessage = { role: 'user', content: "How can I help you?", timestamp:Date.now() };
    }else{
      if (input.trim() === '') return;

      if(messages.length > 0){
        var closure_resonse = ""+await checkForClosure()
        //console.log('closure_resonse: ', closure_resonse);
        if(closure_resonse.replace('.','').toLowerCase() == 'yes'){
          //console.log('inside if');
          is_closing = true;
        }
      }
      
      userMessage = { role: 'user', content: input, timestamp:Date.now() };
      setMessages([...messages, userMessage]);
    }
    
    //console.log("messages before open ai call: ", messages)
    try {
      // Use the fetch API to send a request to OpenAI
      const response = await fetch(api_url, {
        method: api_method,
        headers: {'Content-Type': api_content_type, Authorization: api_auth_key,},
        body: JSON.stringify({
          model: api_model,
          messages: [...messages, sysMessage, userMessage],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the bot's response to the chat
        const botMessage = {role: 'assistant', content: data.choices[0].message.content, timestamp: Date.now()};
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setStartTypeTime(new Date());
        //console.log('startTypeTime: ',startTypeTime)
        //console.log("messages after open ai call: ", messages)
        //console.log('end button display status: ', window.getComputedStyle(document.getElementById('end_btn')).display);
        if(is_closing && window.getComputedStyle(document.getElementById('end_btn')).display === 'none'){
          //console.log('is_closing else:', is_closing)
          document.getElementById('sent_btn').style.display = 'none'
          document.getElementById('end_btn').style.display = 'block'
        }
      } else {
        console.error('Error:', data);
      }

    } catch (error) {
      console.error('Error communicating with OpenAI API:', error);
    }

    // Clear input field
    setInput(''); 
  };

  const calculateScore = async() => {
    //console.log('calculate score');
    sendMessage();
    document.getElementById('sent_btn').style.display = "none";
    document.getElementById('txt_msg').style.display = "none";
    document.getElementById('end_btn').style.display = "none";
    const chat_start_time = new Date(messages[0]['timestamp']);

    //Calculate Average hangle time for the chat.
    let AHT =  new Date(Date.now()).getTime() - chat_start_time.getTime();
    
    //console.log("AHT: ", AHT);
    //Format AHT to hours, minutes and seconds.
    let ss = (Math.floor(AHT / 1000) % 60).toString().padStart(2,'0');
    let mm = (Math.floor(AHT / 1000 / 60) % 60).toString().padStart(2,'0');
    let hh = (Math.floor(AHT / 1000 / 60 / 60)).toString().padStart(2,'0');

    //console.log("Average Handling Time: ", hh + ":" + mm + ":" + ss);
    setAvarageHandleTime(hh + ":" + mm + ":" + ss)

    let assistance_response_time = [];
    let user_response_time = [];
    let diffrence_response_time_sec = [];

    messages.forEach(item => {
      //console.log("loop item: ", item);
      if(item['role']=='assistant')
        assistance_response_time.push(item['timestamp']);
      else
        user_response_time.push(item['timestamp']);
    });
    // console.log("assistance_response_time: ", assistance_response_time);
    // console.log("user_response_time: ", user_response_time);

    for(let i=0; i<user_response_time.length; i++){
      // console.log("user_response_time string: ", user_response_time[i]);
      // console.log("assistance_response_time string: ", assistance_response_time[i]);
      let ust = new Date(user_response_time[i]).getTime()
      let art = new Date(assistance_response_time[i]).getTime()
      // console.log("user_response_time: ", ust);
      // console.log("assistance_response_time: ", art);

      let diff = ust - art;
      // console.log("the diffrence is: ", diff);
      // console.log("the diffrence in sec: ", (Math.floor(diff / 1000) % 60).toString().padStart(2,'0'));
      diffrence_response_time_sec.push((Math.floor(diff / 1000) % 60))
    }
    //console.log("diffrence in response time: ", diffrence_response_time_sec);
    
    let sum_response_time=0;
    diffrence_response_time_sec.forEach(item =>{
      sum_response_time += item;
    });

    // console.log('sum response time: ',sum_response_time);
    // console.log('average response time: ', sum_response_time/diffrence_response_time_sec.length)
    setAverageResponseTime((sum_response_time/diffrence_response_time_sec.length).toFixed(1));

    //Calculating typing speed
    console.log('typeSpeed: ',typeSpeed);
    let sum_type_speed = 0;
    typeSpeed.forEach(item=>{
      sum_type_speed+=parseFloat(item);
    });
    console.log('sum_type_speed: ',sum_type_speed);
    setAverageTypeSpeed((sum_type_speed/typeSpeed.length).toFixed(1))

    //calculating sentiment analysis
    //console.log(messages)
    let user_messages=[];
    messages.forEach(dict=>{
      //console.log(dict['role']);
      if(dict['role'] == 'user'){
        user_messages.push(dict['content']);
      }
    });
    //console.log('user_message: ', user_messages);

    try{
        comprehend.batchDetectSentiment({"LanguageCode": "en", "TextList": user_messages}, function (err, data) {
          if (err) console.log("error form AWS: ", err, err.stack); // an error occurred
          else{//succesfull response
            console.log("succesful data comeback: ", data); 
            var list_csi_score = [];
            data.ResultList.forEach(item =>{
              var positive = parseFloat(item["SentimentScore"]["Positive"]);
              var negative = parseFloat(item["SentimentScore"]["Negative"]);
              var mixed = parseFloat(item["SentimentScore"]["Mixed"]);
              var neutral = parseFloat(item["SentimentScore"]["Neutral"]);

              //list_csi_score.push((positive-((negative*-1)+(mixed*-0.5)+(neutral*-0.5)))*5);
              //list_csi_score.push((positive-negative-(mixed*0.5)-(neutral*0.5))*5);
              list_csi_score.push((positive-(negative-(mixed*0.5)-(neutral*0.7)))*5);
            });

            console.log("List CSI score: ",list_csi_score)
            var sum_csi = 0;
            list_csi_score.forEach(item=>{
              sum_csi+=parseFloat(item)
            });

            setAverageSentimentScore((sum_csi/list_csi_score.length).toFixed(2));
          }
        });
      }catch(error){
        console.log('Error in sentiment score: ', error)
      }

    document.getElementById('score_holder').style.display = "block";
  };

  useEffect(()=>{
    //console.log('initial execution: ', initial_execution)
    if(initial_execution){
      sendMessage();
      initial_execution = false
    }  
    // var message_box = document.getElementById('messge_box');
    // message_box.scrollTop = message_box.scrollHeight;
  });

  return (
    <div style={styles.chatContainer}>
      {/* <select onChange={changeOption} style={styles.dropDown}>
        <option value='angry' selected="selected">Angry Customer</option>
        <option value='confused'>Confused Customer</option>
        <option value='silent'>Silient or Reserved Customer</option>
        <option value='assertive'>Knowledgeable or Assertive Customer</option>
        <option value='priceConsious'>Price-Conscious Customer</option>
        <option value='escalationProne'>Escalation-Prone Customer</option>
      </select> */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            id='messge_box'
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#FFF',
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <textarea
        id='txt_msg'
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isVoiceTest}//"Type your message..."      
      >{testAreaValue}</textarea>
      <button id='sent_btn' onClick={sendMessage} style={styles.sendButton}>Send</button>
      <button id='end_btn' onClick={calculateScore} style={styles.endButton} >End Chart</button>
      <div id='score_holder' hidden>
        <div><span>Average Handle Time: {AverageHandleTime}</span></div>
        <div><span>Average Response Time: {AverageResponseTime} secs.</span></div>
        <div><span>Average Type Speed: {averageTypeSpeed} words/min.</span></div>
        <div><span>CSI score: {averageSentimentScore}</span></div>
      </div>
    </div>   
  );
};

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '450px',
    height: '600px',
    margin: '0 auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '400px',
    overflowY: 'scroll',
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  message: {
    maxWidth: '80%',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '8px',
  },
  input: {
    width: '100%',
    height: '55px',
    resize: 'none',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  sendButton: {
    padding: '10px 20px',
    marginTop: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  endButton: {
    padding: '10px 20px',
    marginTop: '10px',
    backgroundColor: '#FF0000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  dropDown: {
    padding: '10px 20px',
    marginBottom:'9px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'solid 1px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default ChatBot;
