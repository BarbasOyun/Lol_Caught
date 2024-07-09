import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import caught from './CAUGHT.png';
import SummonerDisplay from './Summoner';
import AdsComponent from './AdsComponent';

function App() {
  const API_KEY = "XXXXXXXXXXXXXXXXXXXXXXXX";
  const [leagueVersion, setLeagueVersion] = useState("");

  const [forceUpdate, setForceUpdate] = useState(false);

  //Summoners
  //const [riotAccData, setRiotAccData] = useState({}); useless for now
  const [canSearchPlayer, setCanSearchPlayer] = useState(true);

  //Summoner1
  const [summoner1, setSummoner1] = useState(new Summoner());
  const [summoner1Search, setSummoner1Search] = useState(new SummonerSearch(summoner1));

  //Summoner2
  const [summoner2, setSummoner2] = useState(new Summoner());
  const [summoner2Search, setSummoner2Search] = useState(new SummonerSearch(summoner2));

  useEffect(() => {
    //console.log("Start");
    getLeagueVersion();
    document.body.style = 'background-color: rgb(231, 230, 227);';
  }, []);

  useEffect(() => {
    //console.log("ReRender");
  });

  function searchForPlayer(summonerSearch = new SummonerSearch(), setFunc = s => { }, onSearchDone = () => { }, onGetHistory = () => { }) {
    if (canSearchPlayer) {
      setCanSearchPlayer(false);
    }
    else {
      console.log("Wait before searching again");
      return;
    }

    const summoner = summonerSearch.summoner;

    //Get Riot Account-V1
    //console.log("Search :", summoner.gameName, summoner);
    const APICallRiotAcc = "https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" + summoner.gameName + "/" + summoner.tag + "?api_key=" + API_KEY;

    axios.get(APICallRiotAcc).then(function (response) {
      //Success
      console.log("Riot Account data for " + summoner.gameName + " :", response.data);
      //setRiotAccData(response.data);

      //Summoner Infos
      summoner.puuid = response.data.puuid;
      getSummonerInfo(summoner, onSearchDone);

      //Mastery
      getAllMasterys(summoner, masterys => {
        getChampionInfo(masterys[0].championId, "Hightest Mastery ->", champInfo => summoner.highestMastery = champInfo.name);
        //getChampionInfo(masterys[masterys.length - 1].championId, "Lowest Mastery ->");
      });

      //Mastery Test
      //const championMasteryId = 266; //Aatrox
      //getMastery(summoner.puuid, championMasteryId);

      //Match History
      getAllMatchIds(summoner.puuid, matchIds => {
        //getmatch(matchIds[0], 0, "Last "); //Get Last Match
        getAllMatches(summoner, matchIds, () => {
          onGetHistory();
          manageCanSearchPlayer();

          getAverageDeath(summonerSearch, setFunc);
          checkForBothPlayers();
        }); //Get All Matches in history
      });
    }).catch(function (error) {
      //Error
      console.log(error);
      manageCanSearchPlayer();
      onSearchDone();
    })
  }

  function manageCanSearchPlayer() {
    setTimeout(() => {
      setCanSearchPlayer(true);
    }, 1100);
  }

  function checkForBothPlayers() {
    if (summoner1Search.historyDone && summoner2Search.historyDone) {
      console.log("Both Players Found");
      comparePlayers(summoner1Search, summoner2Search);
    }
  }

  function comparePlayers(sSearch1, sSearch2) {
    let playerWithMostDeath;
    let otherPlayer;

    if (sSearch1.deathCount >= sSearch2.deathCount) {
      playerWithMostDeath = sSearch1;
      otherPlayer = sSearch2;
    } else {
      playerWithMostDeath = sSearch2;
      otherPlayer = sSearch1;
    }

    console.log("Player With Most Deaths :", playerWithMostDeath.summoner.gameName);

    playerWithMostDeath.moreDeathPercentage = playerWithMostDeath.deathCount / otherPlayer.deathCount;

    summoner1Search.statsCompareDone = true;
    summoner2Search.statsCompareDone = true;
  }

  //#region RIOT API

  function getLeagueVersion() {
    //Get League Version
    axios.get("https://ddragon.leagueoflegends.com/api/versions.json").then(function (response) {
      console.log("league Version : ", response.data[0]);
      setLeagueVersion(response.data[0]);
    }).catch(function (error) {
      console.log(error);
    })
  }

  function getSummonerInfo(summoner, onComplete = () => { }) {
    //Get SUMMONER-V4
    const APICallSummoner = "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" + summoner.puuid + "?api_key=" + API_KEY;

    axios.get(APICallSummoner).then(function (response) {
      console.log("Summoner Data :", response.data);
      summoner.sData = response.data;
      onComplete();
    }).catch(function (error) {
      onComplete();
      console.log(error);
    })
  }

  function getChampionInfo(id, additionalLog = "", onSuccess = champInfo => { }) {
    const championJsonLink = "https://ddragon.leagueoflegends.com/cdn/" + leagueVersion + "/data/en_US/champion.json";

    axios.get(championJsonLink).then(function (response) {
      //console.log("Champion.json :", response.data.data);
      const championInfo = Object.values(response.data.data).find(e => e.key === id.toString())
      console.log(additionalLog, "Champion Info :", championInfo.name, championInfo);
      onSuccess(championInfo);
    }).catch(function (error) {
      console.log(error);
    })
  }

  function getMastery(puuid, championId) {
    //Get CHAMPION-MASTERY-V4 : Mastery
    const APICallMastery = "https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/" + puuid + "/by-champion/" + championId + "?api_key=" + API_KEY;

    getChampionInfo(championId, "", champInfo => {
      //console.log(champInfo.name);
      axios.get(APICallMastery).then(function (response) {
        console.log("Mastery : " + champInfo.name, response.data);
      }).catch(function (error) {
        console.log(error);
      })
    });
  }

  function getAllMasterys(summoner, onSuccess = masterys => { }) {
    //Get All Mastery
    const APICallAllMastery = "https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/" + summoner.puuid + "?api_key=" + API_KEY;

    axios.get(APICallAllMastery).then(function (response) {
      console.log("All Mastery for " + summoner.gameName + " : ", response.data);
      onSuccess(response.data);
    }).catch(function (error) {
      console.log(error);
    })
  }

  function getAllMatchIds(puuid, onSuccess = matchIds => { }) {
    //Get Match ids -> string(ids) list
    const APICallMatchIds = "https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?api_key=" + API_KEY;

    axios.get(APICallMatchIds).then(function (response) {
      //console.log("Match ids : ", response.data);
      onSuccess(response.data);
    }).catch(function (error) {
      console.log(error);
    })
  }

  function getmatch(summoner, matchId, matchNbr = 0, addLog = "") {
    const APICallMatch = "https://europe.api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=" + API_KEY;

    axios.get(APICallMatch).then(function (response) {
      const match = response.data;
      console.log(addLog, "Match : " + matchNbr, match,
        "Deaths :", match.info.participants.find(e => e.riotIdGameName === summoner.gameName && e.riotIdTagline === summoner.tag).deaths);
    }).catch(function (error) {
      console.log(error);
    })
  }

  function getAllMatches(summoner, matchIdList, onSuccess = () => { }) {
    let matchCount = 0;

    //reset match history if needed
    if (summoner.matchHistory.length > 0) {
      summoner.matchHistory = [];
    }

    //Wait 1.1 sec -> max 20 request / sec RIOT API limit
    setTimeout(() => {
      //Find match for each Id
      matchIdList.forEach(function (matchId) {
        const APICallAllMatches = "https://europe.api.riotgames.com/lol/match/v5/matches/" + matchId + "?api_key=" + API_KEY;

        axios.get(APICallAllMatches).then(function (response) {
          const match = response.data;
          summoner.matchHistory.push(match);
          matchCount++;
        }).catch(function (error) {
          console.log(error);
        })
      })

      //Wait for every match request
      waitCondition(() => { return matchCount >= 20 }, () => {
        //console.log("Match History :", summoner.matchHistory);
        onSuccess();
      });
    }, 1100);
  }

  function getAverageDeath(summonerSearch, setFunc = s => { }) {
    const summoner = summonerSearch.summoner;
    let deathCount = 0;

    summoner.matchHistory.forEach(function (match, i) {
      deathCount += deathsThisMatch(summoner, match, i);
    });

    const averageDeaths = deathCount / summoner.matchHistory.length;

    console.log("Deaths Count :", deathCount, "Average Deaths / Match :", averageDeaths);
    setFunc(summonerSearch.setData(s => s.deathCount = deathCount));
    setFunc(summonerSearch.setData(s => s.averageDeaths = averageDeaths));
    setForceUpdate(!forceUpdate);
    return averageDeaths;
  }

  function deathsThisMatch(summoner, match, matchNumber = undefined) {
    let deathsThisMatch = match.info.participants.find(e => e.riotIdGameName === summoner.gameName && e.riotIdTagline === summoner.tag).deaths;
    console.log("Match : " + matchNumber, match, "Deaths :", deathsThisMatch);
    return deathsThisMatch;
  }

  //#endregion

  function waitCondition(condition, onComplete) {
    if (condition() === false) {
      window.setTimeout(waitCondition, 100, condition, onComplete);
    } else {
      onComplete();
    }
  }

  function onPressEnter(event, action = () => { }) {
    if (event.keyCode === 13) {
      //console.log("Enter pressed");
      action();
    }
  }

  function graphBar(summonerSearch = new SummonerSearch(), additionalClasses) {
    return <div className={"bgColor-red " + additionalClasses} style={{ width: "1.3em", height: (5 * summonerSearch.moreDeathPercentage) + "em" }}>
      <p className='margin-autoR' style={{ marginTop: 400 * summonerSearch.moreDeathPercentage + "%" }}>{summonerSearch.averageDeaths}</p>
    </div>
  }

  return (
    <div className="App bgcolor-whitePaper">
      <div className="container">
        <h2>League of legends caught</h2>
        {!summoner1Search.statsCompareDone &&
          <img src={caught} alt="Caught" />}
        <br></br>
      </div>

      <div className="center dGrid gridTemplate-01">
        {SummonerDisplay("1", summoner1Search, setSummoner1Search, searchForPlayer, onPressEnter, leagueVersion, canSearchPlayer)}
        <div className="vAlign">
          <h2>VS</h2>
        </div>
        {SummonerDisplay("2", summoner2Search, setSummoner2Search, searchForPlayer, onPressEnter, leagueVersion, canSearchPlayer)}
      </div>

      {summoner1Search.historyDone && summoner2Search.historyDone &&
        <div>
          <h3>Stats Graphs :</h3>
          <h4>Players Deaths graph :</h4>
        </div>
      }

      {summoner1Search.statsCompareDone &&
        <div className="center wh_02">
          {graphBar(summoner1Search, "origin_01")}
          {graphBar(summoner2Search, "origin_02")}
        </div>
      }

      <div className="center wh_02"></div>

      <div className="center">
        <p><strong>Disclaimer :</strong> Lol Caught was not intended to be used to Shame players based on their performance but for you to compare them between friends, remember that in League of Legends death can be the best strategy.</p>
        <p>Lol Caught was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games.  Riot Games does not endorse or sponsor this project.</p>
      </div>

      <div className="center wh_04"></div>

      <div className="center wh_01">
        <AdsComponent dataAdSlot='5445241981' />
      </div>
    </div>
  );
}

class Summoner {
  puuid = "";
  gameName = "";
  tag = "";
  sData = {};
  matchHistory = [];
  highestMastery = "";
}

class SummonerSearch {
  summoner = new Summoner();
  summonerDataDone = false;
  historyDone = false;
  statsCompareDone = false;

  //Data
  deathCount = 0;
  averageDeaths = 0;
  moreDeathPercentage = 1;

  setData(changeData = copy => { }) {
    let clone = this;
    changeData(clone);
    return clone;
  }

  constructor(summoner) {
    this.summoner = summoner;
  }
}

export default App;
