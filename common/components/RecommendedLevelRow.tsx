import React from 'react';

import {getMaimaiSongsLink} from '../arcade-songs';
import {GameRegion} from '../game-region';
import {GameVersion, LATEST_VERSION} from '../game-version';
import {getOfficialLevel} from '../level-helper';
import {RecommendedLevel} from '../rank-functions';

interface Props {
  gameRegion?: GameRegion;
  gameVer?: GameVersion;
  rankTitle: string;
  recLv: RecommendedLevel;
  includeOldVersions?: boolean;
}

export class RecommendedLevelRow extends React.PureComponent<Props> {
  render() {
    const {gameRegion, gameVer, rankTitle, recLv, includeOldVersions} = this.props;
    const resolvedGameVer = gameVer ?? LATEST_VERSION;
    const officialLv = getOfficialLevel(resolvedGameVer, recLv.lv);
    const internalLv = recLv.lv.toFixed(1);
    const minGameVer = includeOldVersions ? 0 : resolvedGameVer;
    return (
      <tr>
        <td className="recLvCell">
          <a
            href={getMaimaiSongsLink(internalLv, true, gameRegion, minGameVer, resolvedGameVer)}
            target="_blank"
          >
            {internalLv}
          </a>{' '}
          (
          <a
            href={getMaimaiSongsLink(officialLv, false, gameRegion, minGameVer, resolvedGameVer)}
            target="_blank"
          >
            {officialLv}
          </a>
          )
        </td>
        <td>{rankTitle}</td>
        <td>{recLv.minAchv.toFixed(4)}%</td>
        <td>{recLv.rating}</td>
      </tr>
    );
  }
}
