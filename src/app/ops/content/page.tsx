"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  ShieldCheck,
  FileQuestion,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ContentSkillSummary,
  ContentVerificationStatus,
  ContentProvenanceSource,
} from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export default function OpsContentPage() {
  const [skills, setSkills] = useState<ContentSkillSummary[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [streamFilter, setStreamFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [missingVerificationOnly, setMissingVerificationOnly] = useState(false);
  const [missingResourcesOnly, setMissingResourcesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadContent = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (streamFilter !== "ALL") params.set("stream", streamFilter);
      if (subjectFilter !== "ALL") params.set("subject", subjectFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (sourceFilter !== "ALL") params.set("sourceType", sourceFilter);
      if (missingVerificationOnly) params.set("missingVerificationOnly", "true");
      if (missingResourcesOnly) params.set("missingResourcesOnly", "true");

      const res = await opsFetch(`/api/ops/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setSkills(data.skills || []);
      }
    } catch (err) {
      console.error("Failed to load content operations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [streamFilter, subjectFilter, statusFilter, sourceFilter, missingVerificationOnly, missingResourcesOnly]);

  const filteredSkills = skills.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchId = s.id.toLowerCase().includes(q);
      const matchSubject = s.subjectId.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchSubject) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ContentVerificationStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-950 text-emerald-300 border border-emerald-800";
      case "INTERNALLY_VERIFIED":
        return "bg-teal-950 text-teal-300 border border-teal-800";
      case "QUALITY_CHECKED":
        return "bg-blue-950 text-blue-300 border border-blue-800";
      case "MAPPED":
        return "bg-indigo-950 text-indigo-300 border border-indigo-800";
      case "NEEDS_REVIEW":
        return "bg-yellow-950 text-yellow-300 border border-yellow-800";
      case "DRAFT":
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const getSourceBadge = (source: ContentProvenanceSource) => {
    switch (source) {
      case "OFFICIAL_CURRENT":
        return "bg-purple-950 text-purple-300 border border-purple-800 font-semibold";
      case "AUTHENTIC_BAC":
        return "bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold";
      case "TEXTBOOK":
        return "bg-blue-950 text-blue-300 border border-blue-800";
      case "BAC_MASTERY_ORIGINAL":
        return "bg-slate-800 text-slate-300 border border-slate-700";
      case "EXTERNAL_REFERENCE":
        return "bg-amber-950 text-amber-300 border border-amber-800";
      case "UNVERIFIED":
      default:
        return "bg-red-950 text-red-400 border border-red-800";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Content Operations & Verification</h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
              {filteredSkills.length} of {report?.totalSkills || 0} skills
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative pedagogical registry. Tracks curriculum alignment, provenance, twin-variant coverage, and verification status without inflating readiness claims.
          </p>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sciences Exp Skills</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{report.byStream.sciences_exp || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Math, Physics, Natural Sciences</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Math Stream Skills</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{report.byStream.math || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero Biology Invariant Enforced</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gestion & Éco Skills</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">{report.byStream.gestion_eco || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Accounting, Economics, Law, Math</div>
          </div>
          <div className="bg-slate-900 border border-red-950/60 rounded-xl p-4 bg-red-950/10">
            <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Unverified / Review Gaps</div>
            <div className="text-xl font-bold text-red-400 mt-1 font-mono">{report.missingVerificationCount || 0}</div>
            <div className="text-[11px] text-red-500/80 mt-0.5">Actionable content backlog</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Stream Filter */}
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Streams</option>
            <option value="sciences_exp">Sciences Expérimentales</option>
            <option value="math">Mathématiques</option>
            <option value="gestion_eco">Gestion & Économie</option>
          </select>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Subjects</option>
            <option value="math">Mathématiques</option>
            <option value="physics">Physique</option>
            <option value="natural_sciences">Sciences Naturelles</option>
            <option value="accounting">Comptabilité</option>
            <option value="economics">Économie</option>
            <option value="law">Droit</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="INTERNALLY_VERIFIED">INTERNALLY_VERIFIED</option>
            <option value="QUALITY_CHECKED">QUALITY_CHECKED</option>
            <option value="MAPPED">MAPPED</option>
            <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
            <option value="DRAFT">DRAFT</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Sources</option>
            <option value="OFFICIAL_CURRENT">OFFICIAL_CURRENT</option>
            <option value="AUTHENTIC_BAC">AUTHENTIC_BAC</option>
            <option value="TEXTBOOK">TEXTBOOK</option>
            <option value="BAC_MASTERY_ORIGINAL">BAC_MASTERY_ORIGINAL</option>
            <option value="EXTERNAL_REFERENCE">EXTERNAL_REFERENCE</option>
            <option value="UNVERIFIED">UNVERIFIED</option>
          </select>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search skill name or identifier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-4 pt-1 border-t border-slate-800/60 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={missingVerificationOnly}
              onChange={(e) => setMissingVerificationOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Missing Verification Only</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={missingResourcesOnly}
              onChange={(e) => setMissingResourcesOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Missing Resources Only</span>
          </label>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            Loading pedagogical content inventory...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1">
            <FileQuestion className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="font-semibold text-slate-300">No matching skills found</div>
            <div className="text-[11px] text-slate-500">
              Try adjusting the stream, subject, or verification status filters.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">Skill & Identifier</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Stream</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source Provenance</th>
                  <th className="px-4 py-3">Twins</th>
                  <th className="px-4 py-3">Gaps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-slate-200">{skill.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">{skill.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 uppercase font-mono text-[11px]">
                      {skill.subjectId}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {skill.streamId}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${getStatusBadge(skill.verificationStatus)}`}>
                        {skill.verificationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getSourceBadge(skill.sourceType)}`}>
                        {skill.sourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${skill.hasPracticeVariant ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          P
                        </span>
                        <span className={`px-1.5 py-0.5 rounded ${skill.hasRetestVariant ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                          R
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      {skill.missingResources && skill.missingResources.length > 0 ? (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{skill.missingResources.length} missing</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
