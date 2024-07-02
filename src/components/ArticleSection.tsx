import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NumberLine } from "./NumberLine";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
} from "../api/prompts";
import Tooltip from "@mui/material/Tooltip";

type ArticleSectionProps = {
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
};

export const ArticleSection = ({
  politicalBias,
  objectivityBias,
}: ArticleSectionProps) => {
  //   const [value, setValue] = useState(0);

  return (
    <div className="flex flex-col justify-start gap-2 items-start text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Article</h2>
          {/** Add tooltip here */}
          <Tooltip title="This section provides an overview of the article's analysis, including its objectivity score and political bias score. These scores help you understand the article's factuality and political leaning.">
            <InfoOutlinedIcon
              style={{ width: "16px", height: "16px" }}
              className="mt-1"
            />
          </Tooltip>
        </div>
        {/** Thumbs up/down feedback buttons here */}
      </div>
      {/** PoliticalBiasSection */}
      {/* <input
        type="range"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
      /> */}
      <div className="flex items-start justify-center gap-4 w-full">
        <NumberLine
          leftText="Left wing"
          rightText="Right wing"
          tickPosition={politicalBias.bias_score}
          mode="political"
        />
        <Tooltip title="This section evaluates the political bias of the article, assigning a bias score from 0 to 100. A score of 0 indicates a very left-wing bias, 50 is moderate, and 100 is very right-wing. The analysis identifies language, framing, selection of facts, and sources that indicate political bias, using specific examples from the article.">
          <InfoOutlinedIcon
            style={{ width: "12px", height: "12px" }}
            className="mt-1"
          />
        </Tooltip>
      </div>
      <p className="text-sm">{politicalBias.analysis}</p>
      {/** ObjectivityBiasSection */}
      <div className="flex items-start justify-center gap-4 w-full">
        <NumberLine
          leftText="Opinion"
          rightText="Factual"
          tickPosition={objectivityBias.rhetoric_score}
          mode="objectivity"
        />
        <Tooltip title="This section assesses how opinionated or factual the article is, generating a rhetoric score from 0 to 100. A score of 0 means the article is very opinionated and rhetorical (like an op-ed), while a score of 100 means it is very factual and objective. The analysis highlights language, tone, and use of evidence to determine the level of objectivity, with specific references to the article.">
          <InfoOutlinedIcon
            style={{ width: "12px", height: "12px" }}
            className="mt-1"
          />
        </Tooltip>
      </div>

      <p className="text-sm">{objectivityBias.analysis}</p>
    </div>
  );
};
