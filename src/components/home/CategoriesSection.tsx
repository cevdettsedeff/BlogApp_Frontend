import { CategoryCard } from './CategoryCard';
import { addLocaleToPath, type Locale } from '@/lib/i18n';

interface Category {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  postCount: number;
}

interface CategoriesSectionProps {
  categories: Category[];
  title: string;
  locale: Locale;
}

export function CategoriesSection({ categories, title, locale }: CategoriesSectionProps) {
  const getCategoryHref = (slug: string) => addLocaleToPath(`/categories/${slug}`, locale);

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              href={getCategoryHref(category.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
