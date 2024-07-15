import { ArticleModel, JournalistsModel, PublicationModel } from "../../types";
import { formatDate } from "../../utils/date";
import { Chip } from "../shared/Chip";

type HeaderSectionProps = {
  article: ArticleModel;
  publication: PublicationModel;
  journalists: JournalistsModel[];
};

export const HeaderSection = ({
  article,
  publication,
  journalists,
}: HeaderSectionProps) => {
  // For when i add displaying of title and date:
  // Display the date in a readable format with time zone
  const formattedDate = formatDate(article.date, "America/New_York");

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xl font-medium m-2"> {article.title}</span>
      <div className="flex justify-start flex-wrap items-center gap-3">
        <Chip text={formattedDate} />
        <Chip text={publication.name} />
        {journalists.map((journalist, index) => (
          <Chip text={journalist.name} key={index} />
        ))}
      </div>
    </div>
  );
};
