import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    postCount: number;
  };
  href: string;
}

export function CategoryCard({ category, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative block rounded-xl overflow-hidden aspect-[4/3]"
    >
      {/* Background Image */}
      <Image
        src={category.imageUrl}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Post count badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
        <FileText className="h-3 w-3" />
        <span>{category.postCount}</span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
        <p className="text-white/70 text-sm line-clamp-2">{category.description}</p>
      </div>
    </Link>
  );
}
