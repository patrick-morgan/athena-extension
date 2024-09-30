import { Badge } from "@/components/ui/badge";
import { ArticleModel, JournalistsModel, PublicationModel } from "@/types";
import { formatDate } from "@/utils/date";

type HeaderSectionProps = {
  article: ArticleModel;
  publication: PublicationModel | null;
  journalists: JournalistsModel[] | null;
};

export const HeaderSection = ({
  article,
  publication,
  journalists,
}: HeaderSectionProps) => {
  const publishedDate = formatDate(article.date_published);
  const updatedDate = article.date_updated
    ? formatDate(article.date_updated)
    : null;

  return (
    <div className="space-y-2 w-full">
      <h1 className="text-2xl font-bold">{article.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Published: {publishedDate}</Badge>
        {updatedDate && (
          <Badge variant="secondary">Updated: {updatedDate}</Badge>
        )}
        {publication && (
          <Badge variant="secondary">
            {publication.name ?? publication.hostname}
          </Badge>
        )}
        {!!journalists?.length && (
          <>
            {journalists.map((journalist, index) => (
              <Badge key={index} variant="outline">
                {journalist.name}
              </Badge>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
