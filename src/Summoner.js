import { useState } from "react";
import caught from './CAUGHT.png';

const SummonerDisplay = (playerNbr, summonerSearch, setSummonerFunc, searchFunc, onKeyDownFunc, leagueVersion, displaySearchButton) => {
  const [forceRender, setForceRender] = useState(false);

  const summoner = summonerSearch.summoner;

  function search() {
    searchFunc(summonerSearch, s => setSummonerFunc(s), () => {
      summonerSearch.summonerDataDone = true;
      setForceRender(!forceRender);
    }, () => {
      summonerSearch.historyDone = true;
      setForceRender(!forceRender);
    });
  }

  return (
    <div>
      <h3>Player {playerNbr} : {summoner.gameName}{summoner.gameName ? "#" : ""}{summoner.tag}</h3>
      <div className="wh_auto">
        <div className="dInline-block">
          <p>Name</p>
          <input id={"GameNameInput" + playerNbr} type="text" onChange={e => summoner.gameName = e.target.value}
            onKeyDown={e => onKeyDownFunc(e, search)}></input>
        </div>
        <div className="dInline-block">
          <p>Tag</p>
          <input id={"TagInput" + playerNbr} type="text" onChange={e => summoner.tag = e.target.value}
            onKeyDown={e => onKeyDownFunc(e, search)}></input>
        </div>
        {displaySearchButton &&
          <div className="dInline-block">
            <button onClick={e => search()} onKeyDown={e => onKeyDownFunc(e, search)}>search player</button>
          </div>}
      </div>
      <p>Summoner Level : <strong>{summoner?.sData?.summonerLevel ? summoner.sData.summonerLevel : 0}</strong></p>
      {
        <img src={"https://ddragon.leagueoflegends.com/cdn/" + leagueVersion + "/img/profileicon/" +
          (JSON.stringify(summoner.sData) !== '{}' ? summoner.sData.profileIconId : 29) + ".png"} alt="Icon"></img> //id 29 = Default icon
      }
      {summonerSearch.summonerDataDone && JSON.stringify(summoner.sData) === '{}' &&
        <p className="color-red">Search Failed</p>
      }
      {summonerSearch.deathCount !== 0 &&
        <div>
          <p>Highest Mastery : <strong>{summoner.highestMastery}</strong></p>
          <p>Total Deaths in Match History : <strong>{summonerSearch.deathCount}</strong></p>
          <p>Average Deaths : <strong>{summonerSearch.averageDeaths}</strong></p>
        </div>
      }
      {summonerSearch.moreDeathPercentage !== 1 &&
        <div>
          <p>Died <strong>{parseFloat(summonerSearch.moreDeathPercentage * 100 - 100).toFixed(2)}%</strong> more</p>
          <br></br>
          <img src={caught} alt="Caught" />
        </div>
      }
    </div>);
}

export default SummonerDisplay;