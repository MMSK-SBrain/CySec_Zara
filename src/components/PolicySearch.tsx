"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PolicySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/policies/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.policies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search policies..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Search"}
        </Button>
      </form>

      <div className="space-y-3">
        {results.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <CardTitle className="text-base">{policy.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{policy.content}</p>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No policies found. Try searching for "leave".</p>
        )}
      </div>
    </div>
  );
}
