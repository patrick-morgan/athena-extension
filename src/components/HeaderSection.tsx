import { Badge } from "@/components/ui/badge";
import { ArticleModel, JournalistsModel, PublicationModel } from "@/types";
import { formatDate } from "@/utils/date";

type HeaderSectionProps = {
  article: ArticleModel;
  publication: PublicationModel | null;
  journalists: JournalistsModel[] | null;
  onJournalistClick: (journalistId: string) => void;
  onPublicationClick: () => void;
};

export const HeaderSection = ({
  article,
  publication,
  journalists,
  onJournalistClick,
  onPublicationClick,
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
          <Badge
            variant="secondary"
            className="text-xs font-medium cursor-pointer hover:bg-secondary/80"
            onClick={onPublicationClick}
          >
            {publication.name ?? publication.hostname}
          </Badge>
        )}
        {!!journalists?.length && (
          <>
            {journalists.map((journalist, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => {
                  console.log("just cliucked on", journalist);
                  onJournalistClick(journalist.id);
                }}
              >
                {journalist.name}
              </Badge>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
