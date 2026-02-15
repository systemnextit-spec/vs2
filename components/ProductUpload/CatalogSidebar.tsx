import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Category, SubCategory, ChildCategory, Tag } from '../../types';

interface CatalogSidebarProps {
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  tags: Tag[];
  data: any;
  onChange: (data: any) => void;
}

const CatalogSidebar: React.FC<CatalogSidebarProps> = ({
  categories,
  subCategories,
  childCategories,
  tags,
  data,
  onChange
}) => {
  const [showTags, setShowTags] = useState(false);

  const filteredSubCategories = subCategories.filter(
    sc => sc.categoryId === data.category || sc.categoryName === data.category
  );

  const filteredChildCategories = childCategories.filter(
    cc => cc.subCategoryId === data.subCategory || cc.subCategoryName === data.subCategory
  );

  const handleTagToggle = (tagName: string) => {
    const newTags = data.tags.includes(tagName)
      ? data.tags.filter((t: string) => t !== tagName)
      : [...data.tags, tagName];
    onChange({ tags: newTags });
  };

  return (
    <div className="sticky to p-6 space-y-4">
      {/* Catalog & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Catalog & Search</h3>

        <div className="space-y-4">
          {/* Base Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Category <span className="text-red-500">*</span>
            </label>
            <select
              value={data.category}
              onChange={(e) => onChange({ 
                category: e.target.value,
                subCategory: '',
                childCategory: ''
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          {filteredSubCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category
              </label>
              <select
                value={data.subCategory}
                onChange={(e) => onChange({
                  subCategory: e.target.value,
                  childCategory: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="">Select subcategory</option>
                {filteredSubCategories.map(sc => (
                  <option key={sc.id} value={sc.name}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Child Category */}
          {filteredChildCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child Category
              </label>
              <select
                value={data.childCategory}
                onChange={(e) => onChange({ childCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="">Select child category</option>
                {filteredChildCategories.map(cc => (
                  <option key={cc.id} value={cc.name}>
                    {cc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={data.condition}
              onChange={(e) => onChange({ condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="New">New</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used">Used</option>
            </select>
          </div>

          {/* Tags & Deep Search */}
          <div>
            <button
              onClick={() => setShowTags(!showTags)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <span>Tags & Deep Search</span>
              <ChevronDown size={16} className={`transition ${showTags ? 'rotate-180' : ''}`} />
            </button>

            {showTags && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tags.map(tag => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.tags.includes(tag.name)}
                        onChange={() => handleTagToggle(tag.name)}
                        className="w-3 h-3 text-blue-500 rounded"
                      />
                      <span className="text-xs text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogSidebar;
