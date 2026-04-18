import PortfolioView from "@/components/PortfolioView";
import portfolio from "@/data/portfolio.json";
import type { PortfolioData } from "@/types/portfolio";

export default function Home() {
  return <PortfolioView data={portfolio as PortfolioData} />;
}
