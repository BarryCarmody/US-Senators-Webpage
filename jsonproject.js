var data;


//Initalise Global Variables for States
var states=[];
var stateCheck=[];
var stateSA=1;

//Initalise Global Variables for Parties
var partys=[];
var partyCheck=[];
var partySA=1;


//Initalise Global Variables for Ranks
var ranks=[];
var rankCheck=[];
var rankSA=1;


//Import Data from JSON file
async function getsenatordata(){
    try{
        const url="senators.json"
        const promise = await fetch(url);
        
        //Error if JSON file not found
        if (!promise.ok) {
            throw new Error(`senator.json not found: ${promise.status}`);
        }

        data = await promise.json();

        //Error if JSON file is empty
        if (!data || Object.keys(data).length===0){
            throw new Error("Empty JSON File");
        } 
        //Error if important info is missing
        else if(data.hasOwnProperty("objects")===false){
            throw new Error("Important Data Missing from JSON File");
        }
        else{
            var datatable = data.objects;
            for (let i = 0; i < datatable.length; i++) {
                if (datatable[i].hasOwnProperty("person")===false || datatable[i].hasOwnProperty("description")===false || datatable[i].hasOwnProperty("extra")===false|| datatable[i].hasOwnProperty("party")===false){
                    throw new Error("Important Data Missing from JSON File. Some data will be missing from page.");
                }
            }
        }

    //Print Error Message
    } catch (error) {
        console.error("Error: ",error.message);
        alert("Error: "+error.message);
    } 
    console.log(data);

    //Call functions to produce webpage
    variableOptions(data);
    partyCount(data);
    leaderList(data);
    createTableHead(data);
    createTable(data);

}


//Function to identify all unique values for Partys, States and Ranks
function variableOptions(data){
    var datatable = data.objects;

    //For each senator check if their party, state and rank are in the respective lists, if not add it.
    for (let i = 0; i < datatable.length; i++) {
        if (!states.includes(datatable[i].description.split('for ')[1])){
            states.push(datatable[i].description.split('for ')[1]);
        }
        if (!partys.includes(datatable[i].party)){
            partys.push(datatable[i].party);
        }
        if (!ranks.includes(datatable[i].senator_rank_label)){
            ranks.push(datatable[i].senator_rank_label);
        }
    }

    //Sort Lists alphabetically
    states.sort();
    partys.sort();
    ranks.sort();
    ranks.reverse();

    //Create Array of ones for each party, state and rank for use in filters 
    stateCheck=Array(states.length).fill(1);
    partyCheck=Array(partys.length).fill(1);
    rankCheck=Array(ranks.length).fill(1);

}

//Count the senators for each party
function partyCount(data){
    var datatable = data.objects;
    let dems=0;
    let reps=0;
    let indos=0;
    //For each senator check if they are in the party. If so add to counter.
    for (let i = 0; i < datatable.length; i++) {
        if (datatable[i].party=="Democrat"){
            dems+=1
        } else if (datatable[i].party=="Republican"){
            reps+=1
        }else {
            indos+=1
        }
    }

    document.getElementById("dems").innerHTML = dems;
    document.getElementById("reps").innerHTML = reps;
    document.getElementById("indos").innerHTML = indos;
}

//Create list of senators with Leadership role
function leaderList(data){
    var datatable = data.objects;
    var listInfo = "<ul>"

    //For loop to make list grouped by party
    for (let p in partys){
        for (let i = 0; i < datatable.length; i++) {
            //Only include senators with a leadership title
            if (datatable[i].party==partys[p] && datatable[i].leadership_title != null){
                listInfo += 
                    "<li>" +
                    datatable[i].leadership_title + ": ";
                if (datatable[i].person.nickname != ""){
                    listInfo += datatable[i].person.nickname
                }  
                else{
                    listInfo +=datatable[i].person.firstname  
                }

                listInfo += " " + datatable[i].person.lastname +
                    " ("+partys[p]+")" +
                    "</li>"; 
            }
        }
    }

    listInfo += "</ul>";

    document.getElementById("list").innerHTML = listInfo  
}

//Create heading of Seantors table
function createTableHead(){
    var tableHead="";
    //Create Senator Heading
    tableHead += "<tr><th style=\"width:1%\"></th><th style=\"width:30%\">Senator</th>";
    //Create Party Heading with on click dropdown menu
    tableHead+="<th style=\"width:21%\"><button id=\"partytext\" class=\"dropdown-btn\" onclick=\"dropPartys()\">Party &#11167</button>"+
        "<div id=\"partycontainer\" class=\"dropdown-container-party\">";
    //Create Show All button for filter dropdown menu
    tableHead+="<button id=\"Party Select All\" class=\"selected\" onclick=\"selectAllPartys()\">Show All</button>";
    
    //Create button for each party for the filter dropdown menu
    for (i=0;i<partys.length;i++){
        tableHead+="<button id=\""+partys[i]+"\" class=\"selected\" onclick=\"togglePartys("+i+")\">"+partys[i]+"</button>"
    } 

    tableHead+= "</div></th>";
    //Create State Heading with on click dropdown menu
    tableHead+="<th style=\"width:25%\"><button id=\"statetext\" class=\"dropdown-btn\" onclick=\"dropStates()\">State &#11167</button>"+
        "<div id=\"statecontainer\" class=\"dropdown-container-state\">";
    //Create Show All button for filter dropdown menu    
    tableHead+="<button id=\"State Select All\" class=\"selected\" onclick=\"selectAllStates()\">Show All</button>";
    
    //Create button for each state for the filter dropdown menu
    for (i=0;i<states.length;i++){
        tableHead+="<button id=\""+states[i]+"\" class=\"selected\" onclick=\"toggleStates("+i+")\">"+states[i]+"</button>"
    }  

    tableHead+= "</div></th>";
    //Create Senator Heading
    tableHead+= "<th style=\"width:13%\">Gender</th>"
    
    //Create Rank Heading with on click dropdown menu
    tableHead+= "<th style=\"width:10%\"><button id=\"ranktext\" class=\"dropdown-btn\" onclick=\"dropRanks()\">Rank &#11167</button>"+
        "<div id=\"rankcontainer\" class=\"dropdown-container-rank\">";
    //Create Show All button for filter dropdown menu 
    tableHead+="<button id=\"Rank Select All\" class=\"selected\" onclick=\"selectAllRanks()\">Show All</button>";

     //Create button for each rank for the filter dropdown menu
    for (i=0;i<ranks.length;i++){
        tableHead+="<button id=\""+ranks[i]+"\" class=\"selected\" onclick=\"toggleRanks("+i+")\">"+ranks[i]+"</button>"
    }  
    
    tableHead+= "</div></th></tr>";

    document.getElementById("tablehead").innerHTML = tableHead   
}

//Produce contents of Senators table
function createTable(data) {
    var datatable = data.objects;

    var tableInfo = "";
    
    //For loops to order table by Party, then State, then Rank
    for (p=0;p<partys.length;p++){
        for (s=0;s<states.length;s++){
            for (r=0;r<ranks.length;r++){
                for (let i = 0; i < datatable.length; i++) {
                    //Take in data used in table
                    let firstnameinfo = datatable[i].person.firstname;
                    let nicknameinfo = datatable[i].person.nickname;
                    let surnameinfo = datatable[i].person.lastname;
                    let partyinfo = datatable[i].party;
                    let stateinfo = datatable[i].description.split('for ')[1];
                    let genderinfo = datatable[i].person.gender_label;
                    let rankinfo = datatable[i].senator_rank_label;

                    let bdayinfo = fixed_date(datatable[i].person.birthday);
                    let startinfo = fixed_date(datatable[i].startdate);
                    let officeinfo = datatable[i].extra.office;
                    let YTinfo = datatable[i].person.youtubeid;
                    let TwitterInfo = datatable[i].person.twitterid;
                    let websiteInfo = datatable[i].website;

                    //Check print if matching party, state and rank from sorting for loops
                    //And check if filter arrays for party, state and rank to see if they should be filtered out
                    if (partyinfo==partys[p] && stateinfo==states[s] && rankinfo==ranks[r] && partyCheck[p]==1 && stateCheck[s]==1 && rankCheck[r]==1){

                        if (window.matchMedia("(max-width: 1070px)").matches){
                            rankinfo = rankinfo.slice(0,3)
                        }

                        tableInfo +=
                            "<tr onclick=\"setDisplay('panel"+i+"')\"><td style =\"width:1%\"></td><td style=\"width:30%\">" +
                            firstnameinfo;
                        
                        //Check if the senator has a nickname and include if so
                        if (nicknameinfo != ""){
                            tableInfo +=
                                " \""+ nicknameinfo + "\"";
                        }

                        tableInfo +=
                            " " + surnameinfo +
                            "</td><td style=\"width:21%\">" +
                            partyinfo +
                            "</td><td style=\"width:25%\">" +
                            stateinfo +
                            "</td><td style=\"width:13%\">" +
                            genderinfo +
                            "</td><td style=\"width:10%\">" +
                            rankinfo +
                            "</td></tr>"; 

                        //Create dropdown menu with additional information for each senator
                        tableInfo +=
                            "<tr id=\"panel"+i+"\"; style=\"display:none\";>"+
                            "<td></td>"+
                            "<td class=\"sendets\" colspan=\"2\"><ul>"+
                            "<li>Office: "+officeinfo+"</li>" +
                            "<li>D.O.B: "+bdayinfo+"</li>" +
                            "<li>Start Date: "+startinfo+"</li></ul></td>"+
                            "<td class=\"sendets\" colspan=\"3\"><ul>"+
                            "<li>"+ "<a href=\""+websiteInfo+"\" target=\"_blank\"><i class=\"fa-solid fa-globe\" style=\"color: #191c70;\"></i> "+websiteInfo+"</a></li>";
                            //Check if the senator has a Youtube and include if so
                            if (YTinfo!=null){
                                tableInfo+="<li>"+ "<a href=\"https://www.youtube.com/"+YTinfo+"\" target=\"_blank\"><i class=\"fa-brands fa-youtube\" style=\"color: #f50a2d;\"></i> "+YTinfo+"</a></li>" 
                            }
                            //Check if the senator has a Twitter and include if so
                            if (TwitterInfo!=null){
                                tableInfo+="<li>"+ "<a href=\"https://www.twitter.com/"+TwitterInfo+"\" target=\"_blank\"><i class=\"fa-brands fa-twitter\" style=\"color: #1da1f2;\"></i> @"+TwitterInfo+"</a></li>"
                            }

                        tableInfo += "</ul></td>"     
                    }
                }
            }
        }
    }
    //Add Half blank row at end of table
    tableInfo+="<tr style =\"height:15px\"><td style =\"width:1%\"></td>"+
            "<td style=\"width:30%\"></td>"+
            "<td style=\"width:21%\"></td>"+
            "<td style=\"width:25%\"></td>"+
            "<td style=\"width:13%\"></td>"+
            "<td style=\"width:10%\"></td></tr>"

    //Add the new html code to the div element with id = 'table'.
    document.getElementById("table").innerHTML = tableInfo
}

//Functionality for clicking each state in the dropdown menu
function toggleStates(pos) {
    //Take input of the position of the clicked button
    
    //Check current id for Show All button and clicked button
    var curclass=document.getElementById(states[pos]);
    var stateSAId=document.getElementById("State Select All");


    //If all states currently selected change all to not selected colour and change filter array
    if(check1(stateCheck)==true){
      stateCheck=Array(states.length).fill(0);
      
      for (i=0; i<states.length;i++){
          var tempclass=document.getElementById(states[i]);
          tempclass.classList.replace("selected","notselected");
      }
  
      //Change Show all to not selected and change filter indicator 
      stateSA=0;
      stateSAId.classList.replace("selected","notselected");
      document.getElementById("statetext").innerHTML = "State &#11163";
    }
    
    //Change clicked button between selected and not selected and change filter array
    if (stateCheck[pos]==0){
        stateCheck[pos]=1;
        curclass.classList.replace("notselected","selected")
        //If this click made all States selected, change show all to selected
        if(check1(stateCheck)==true){
          stateSA=1;
          stateSAId.classList.replace("notselected","selected");
          document.getElementById("statetext").innerHTML = "State &#11167";
        }
    }
    else {
        stateCheck[pos]=0;
        curclass.classList.replace("selected","notselected")
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Functionaly of States Show All button
function selectAllStates(){
    var stateSAId=document.getElementById("State Select All");

    //If Show All not selected, change to selected and change all states to selected and change filter array
    if (stateSA==0){
      stateSA=1;
      stateSAId.classList.replace("notselected","selected");
      document.getElementById("statetext").innerHTML = "State &#11167";
      for (i=0; i < stateCheck.length; i++){
            stateCheck[i]=1;
            var tempclass=document.getElementById(states[i]);
            tempclass.classList.replace("notselected","selected");
      }
    }
    //If Show All selected, change to not selected and change all states to not selected and change filter array
    else{
      stateSA=0;
      stateSAId.classList.replace("selected","notselected");
      document.getElementById("statetext").innerHTML = "State &#11163";
      for (i=0; i < stateCheck.length; i++){
            stateCheck[i]=0;
            tempclass=document.getElementById(states[i]);
            tempclass.classList.replace("selected","notselected");
      }
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Functionality for clicking each party in the dropdown menu
function togglePartys(pos) {
    //Take input of the position of the clicked button
  
    //Check current id for Show All button and clicked button
    var curclass=document.getElementById(partys[pos]);
    var partySAId=document.getElementById("Party Select All");

    //If all partys currently selected change all to not selected colour and change filter array
    if(check1(partyCheck)==true){
      partyCheck=Array(partys.length).fill(0);
      
      for (i=0; i<partys.length;i++){
          var tempclass=document.getElementById(partys[i]);
          tempclass.classList.replace("selected","notselected");
      }
  
      //Change Show all to not selected and change filter indicator
      partySA=0;
      partySAId.classList.replace("selected","notselected");
      document.getElementById("partytext").innerHTML = "Party &#11163";
    }
  
    //Change clicked button between selected and not selected and change filter array
    if (partyCheck[pos]==0){
        partyCheck[pos]=1;
        curclass.classList.replace("notselected","selected")
        //If this click made all Partys selected, change show all to selected
        if(check1(partyCheck)==true){
          partySA=1;
          partySAId.classList.replace("notselected","selected");
          document.getElementById("partytext").innerHTML = "Party &#11167";
        }
    }
    else {
        partyCheck[pos]=0;
        curclass.classList.replace("selected","notselected")
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Functionaly of Partys Show All button
function selectAllPartys(){
    var partySAId=document.getElementById("Party Select All");

    //If Show All not selected, change to selected and change all partys to selected and change filter array
    if (partySA==0){
      partySA=1;
      partySAId.classList.replace("notselected","selected");
      document.getElementById("partytext").innerHTML = "Party &#11167";
      for (i=0; i < partyCheck.length; i++){
          partyCheck[i]=1;
          var tempclass=document.getElementById(partys[i]);
          tempclass.classList.replace("notselected","selected");
      }
    }
    //If Show All selected, change to not selected and change all states to not selected and change filter array
    else{
      partySA=0;
      document.getElementById("partytext").innerHTML = "Party &#11163";
      partySAId.classList.replace("selected","notselected");
      for (i=0; i < partyCheck.length; i++){
          partyCheck[i]=0;
          tempclass=document.getElementById(partys[i]);
          tempclass.classList.replace("selected","notselected");
      }
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Functionality for clicking each rank in the dropdown menu
function toggleRanks(pos) {
    //Take input of the position of the clicked button
  
    //Check current id for Show All button and clicked button
    var curclass=document.getElementById(ranks[pos]);
    var rankSAId=document.getElementById("Rank Select All");
  
    //If all ranks currently selected change all to not selected colour and change filter array
    if(check1(rankCheck)==true){
      rankCheck=Array(ranks.length).fill(0);
      
      for (i=0; i<ranks.length;i++){
          var tempclass=document.getElementById(ranks[i]);
          tempclass.classList.replace("selected","notselected");
      }
  
      //Change Show all to not selected and change filter indicator
      rankSA=0;
      rankSAId.classList.replace("selected","notselected");
      document.getElementById("ranktext").innerHTML = "Rank &#11163";
    }
  
    //Change clicked button between selected and not selected and change filter array
    if (rankCheck[pos]==0){
        rankCheck[pos]=1;
        curclass.classList.replace("notselected","selected")
        //If this click made all Ranks selected, change show all to selected
        if(check1(rankCheck)==true){
          rankSA=1;
          rankSAId.classList.replace("notselected","selected");
          document.getElementById("ranktext").innerHTML = "Rank &#11167";
        }
    }
    else {
        rankCheck[pos]=0;
        curclass.classList.replace("selected","notselected");
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Functionaly of Ranks Show All button
function selectAllRanks(){
    var rankSAId=document.getElementById("Rank Select All");

    //If Show All not selected, change to selected and change all ranks to selected and change filter array
    if (rankSA==0){
      rankSA=1;
      rankSAId.classList.replace("notselected","selected");
      document.getElementById("ranktext").innerHTML = "Rank &#11167";
      for (i=0; i < rankCheck.length; i++){
        rankCheck[i]=1;
          var tempclass=document.getElementById(ranks[i]);
          tempclass.classList.replace("notselected","selected");
      }
    }
    //If Show All selected, change to not selected and change all states to not selected and change filter array
    else{
      rankSA=0;
      rankSAId.classList.replace("selected","notselected");
      document.getElementById("ranktext").innerHTML = "Rank &#11163";
      for (i=0; i < rankCheck.length; i++){
        rankCheck[i]=0;
        tempclass=document.getElementById(ranks[i]);
        tempclass.classList.replace("selected","notselected");
      }
    }
    //Rerun table with new filter requirements
    createTable(data);
}

//Function to check if array is contains all 1s
function check1(array){
    for (i of array){
      if(i!=1){
        return false;
      }
    }
    return true; 
}

//Functionality for when states header is clicked to reveal filter dropdown
function dropStates(){
    var menuopen= document.getElementById("statecontainer");
    //if dropdown is currently showing, hide it. If hiding, show it
    if (menuopen.style.display === "block") {
        menuopen.style.display = "none";
      } else {
        menuopen.style.display = "block";
      }
}

//Functionality for when partys header is clicked to reveal filter dropdown
function dropPartys(){
    var menuopen= document.getElementById("partycontainer");
    //if dropdown is currently showing, hide it. If hiding, show it
    if (menuopen.style.display === "block") {
        menuopen.style.display = "none";
      } else {
        menuopen.style.display = "block";
      }
}

//Functionality for when ranks header is clicked to reveal filter dropdown
function dropRanks(){
    var menuopen= document.getElementById("rankcontainer");
    //if dropdown is currently showing, hide it. If hiding, show it
    if (menuopen.style.display === "block") {
        menuopen.style.display = "none";
      } else {
        menuopen.style.display = "block";
      }
}

//Coverts Dates from YYYY-MM-DD format to DD/MM/YYYY format
function fixed_date(x){
    var new_date=x.split("-")
    new_date.reverse()
    var date=new_date[0]
    for (let i=1;i<new_date.length;i++){
        date+="/"+new_date[i]
    }
    return date
}

//Functionality for when a senator is clicked to reveal more information dropdown
function setDisplay(x){
    var panid =document.getElementById(x);
    //if dropdown is currently showing, hide it. If hiding, show it
    if (panid.style.display == "table-row"){
      panid.style.display = "none";
    } else{
      panid.style.display = "table-row";
    }
}

//Call the inital function
getsenatordata();
