import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { PublicationAnalysisResponse } from "../../api/api";
import { Chip } from "../shared/Chip";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection = ({
  pubResponse,
}: PublicationSectionProps) => {
  const { publication, analysis } = pubResponse;

  return (
    <div className="flex flex-col justify-start gap-2 items-start text-black">
      <h2 className="text-xl font-semibold">Publication</h2>
      <div className="flex flex-col justify-start gap-2 items-start text-black">
        <div className="flex justify-start flex-wrap items-center gap-3">
          <Chip text={publication.name} />
          <Chip
            text={`${analysis.num_articles_analyzed} ${pluralize(
              "Article",
              analysis.num_articles_analyzed
            )} analyzed`}
          />
        </div>
        <div className="flex items-start justify-center gap-4 w-full">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
            mode="political"
          />
          <Tooltip title="This section evaluates the political bias of the publication, assigning a bias score from 0 to 100. A score of 0 indicates a very left-wing bias, 50 is moderate, and 100 is very right-wing. The analysis identifies language, framing, selection of facts, and sources that indicate political bias, using specific examples from the article.">
            <InfoOutlinedIcon
              style={{ width: "12px", height: "12px" }}
              className="mt-1"
            />
          </Tooltip>
        </div>
        {/** ObjectivityBiasSection */}
        <div className="flex items-start justify-center gap-4 w-full">
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
            mode="objectivity"
          />
          <Tooltip title="This section assesses how opinionated or factual the publication is, generating a rhetoric score from 0 to 100. A score of 0 means the article is very opinionated and rhetorical (like an op-ed), while a score of 100 means it is very factual and objective. The analysis highlights language, tone, and use of evidence to determine the level of objectivity, with specific references to the article.">
            <InfoOutlinedIcon
              style={{ width: "12px", height: "12px" }}
              className="mt-1"
            />
          </Tooltip>
        </div>
        <p className="text-sm">{analysis.summary}</p>
      </div>
    </div>
  );
};
