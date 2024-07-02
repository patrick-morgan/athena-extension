import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { SummaryResponseType } from "../api/prompts";
import Tooltip from "@mui/material/Tooltip";
import { parseFootnotes } from "../utils/footnotes";

type SummarySectionProps = {
  summaryResponse: SummaryResponseType;
};

export const SummarySection = ({ summaryResponse }: SummarySectionProps) => {
  const { summary, footnotes } = summaryResponse;

  return (
    <div className="flex flex-col justify-start gap-2 items-start text-black">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Summary</h2>
          {/** Add tooltip here */}
          <Tooltip title="This section provides a concise summary of the article, highlighting its main points, key arguments, and significant evidence. The summary is generated using advanced language models that analyze the article content to ensure it is grounded in reality and provides direct evidence from the text.">
            <InfoOutlinedIcon
              style={{ width: "16px", height: "16px" }}
              className="mt-1"
            />
          </Tooltip>
        </div>
        {/** Thumbs up/down feedback buttons here */}
      </div>
      <p className="text-sm">{parseFootnotes(summary, footnotes)}</p>
    </div>
  );
};
