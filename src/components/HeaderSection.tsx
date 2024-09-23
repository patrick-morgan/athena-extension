import { Badge } from "@/components/ui/badge";
import { ArticleModel, JournalistsModel, PublicationModel } from "@/types";
import { formatDate } from "@/utils/date";

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
  const formattedDate = formatDate(article.date);

  return (
    <div className="space-y-2 w-full">
      <h1 className="text-2xl font-bold">{article.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{formattedDate}</Badge>
        <Badge variant="secondary">
          {publication.name ?? publication.hostname}
        </Badge>
        {journalists.map((journalist, index) => (
          <Badge key={index} variant="outline">
            {journalist.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
