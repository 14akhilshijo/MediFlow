/**
 * APIFeatures – Chainable Mongoose query helper.
 *
 * Supports filtering, sorting, field selection, and pagination
 * driven entirely by URL query parameters.
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *
 *   const docs = await features.query;
 *
 * Query param examples:
 *   ?status=Confirmed                  → filter
 *   ?appointmentDate[gte]=2024-01-01   → range filter
 *   ?sort=-createdAt                   → sort descending
 *   ?fields=firstName,email            → select fields
 *   ?page=2&limit=10                   → pagination
 */
export class APIFeatures {
  constructor(query, queryString) {
    this.query       = query;
    this.queryString = queryString;
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ["page", "sort", "limit", "fields"];
    excluded.forEach((f) => delete queryObj[f]);

    // Convert gte/gt/lte/lt to MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // ── Sort ────────────────────────────────────────────────────────────────────
  sort() {
    if (this.queryString.sort) {
      // "price,-createdAt" → "price -createdAt"
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // ── Field Selection ─────────────────────────────────────────────────────────
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  paginate() {
    const page  = Math.max(1, Number(this.queryString.page)  || 1);
    const limit = Math.min(100, Number(this.queryString.limit) || 10);
    const skip  = (page - 1) * limit;
    this.query  = this.query.skip(skip).limit(limit);
    return this;
  }
}
