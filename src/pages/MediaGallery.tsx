import React, { useState, useEffect } from 'react';
import {
  Film,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building2,
  FileVideo,
  FileImage,
  ArrowUpDown,
  Upload,
} from 'lucide-react';
import { api } from '../services/api';
import { MediaItem } from '../types';

interface MediaGalleryProps {
  onSelectReport: (analysisId: string) => void;
  onNavigateToUpload: () => void;
  defaultSite?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  onSelectReport,
  onNavigateToUpload,
  defaultSite,
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Deletion modal
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [mediaType, industryFilter, sortOrder, defaultSite]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await api.getMediaList({
        search: searchQuery || undefined,
        type: mediaType === 'all' ? undefined : mediaType,
        industry: industryFilter === 'All' ? undefined : industryFilter,
        site: defaultSite === 'All' ? undefined : defaultSite,
        sort: sortOrder,
      });
      setMediaItems(items);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteMedia(mediaToDelete.id);
      setMediaToDelete(null);
      await loadMedia();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMedia();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Film className="w-5 h-5 text-teal-600" />
            Workplace Surveillance Media Gallery &amp; Database
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse stored visual feeds, detection archives, and historical PPE audit runs.
          </p>
        </div>
        <button
          onClick={onNavigateToUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload New Surveillance</span>
        </button>
      </div>

      {/* Filter and Slicer Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filename, site, sector..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Media Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg font-medium">
              <button
                type="button"
                onClick={() => setMediaType('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  mediaType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Media
              </button>
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  mediaType === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  mediaType === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Videos
              </button>
            </div>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Industries</option>
              <option value="Construction Sites">Construction Sites</option>
              <option value="Automobile Manufacturing">Automobile Manufacturing</option>
              <option value="Automobile Assembly Lines">Automobile Assembly Lines</option>
              <option value="Industrial Production Units">Industrial Production Units</option>
              <option value="Warehouses and Logistics Centers">Warehouses and Logistics</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="newest">Newest Uploads</option>
              <option value="oldest">Oldest Uploads</option>
              <option value="highest_risk">Highest Risk Index</option>
              <option value="lowest_safety">Lowest Safety Score</option>
            </select>
          </div>
        </form>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading stored media records...</div>
      ) : mediaItems.length === 0 ? (
        <div className="p-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
          <Film className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-900">No Surveillance Media Found</h4>
          <p className="text-xs text-slate-500">Upload workplace camera footage to populate the database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => {
            const hasAnalysis = !!item.analysis_id;
            const safetyScore = item.safety_score ?? 100;
            const violations = item.confirmed_violations ?? 0;
            const isVideo = item.media_type === 'video';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div
                    onClick={() => item.analysis_id && onSelectReport(item.analysis_id)}
                    className="relative h-44 bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden border-b border-slate-200"
                  >
                    {item.processed_path ? (
                      <img
                        src={item.processed_path}
                        alt={item.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-1">
                        {isVideo ? <FileVideo className="w-8 h-8" /> : <FileImage className="w-8 h-8" />}
                        <span className="text-[10px] font-mono">Raw Media</span>
                      </div>
                    )}

                    {/* Badge Pill for Video/Image */}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1">
                      {isVideo ? 'VIDEO' : 'IMAGE'}
                    </span>

                    {/* Safety Score Badge */}
                    {hasAnalysis && (
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[11px] font-bold backdrop-blur-xs ${
                        safetyScore >= 85
                          ? 'bg-emerald-500/90 text-white'
                          : safetyScore >= 70
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}>
                        {safetyScore}% Safety
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <h3
                      onClick={() => item.analysis_id && onSelectReport(item.analysis_id)}
                      className="text-xs font-bold text-slate-900 truncate hover:text-teal-600 cursor-pointer"
                      title={item.original_name}
                    >
                      {item.original_name}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.site_name}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{item.industry}</span>
                      <span>{(item.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>

                    {hasAnalysis && (
                      <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                        <span className="text-slate-600">
                          {item.total_persons} Workers Detected
                        </span>
                        <span className={violations > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {violations} Violations
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMediaToDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {item.analysis_id && (
                      <button
                        onClick={() => onSelectReport(item.analysis_id!)}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <span>Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {mediaToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              Confirm Media Record Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete <strong className="text-slate-900">{mediaToDelete.original_name}</strong>?
              This will remove the raw file, annotated detection results, and associated alert history.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMediaToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
