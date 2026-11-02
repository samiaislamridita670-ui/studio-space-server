const express = require("express");
const { ObjectId } = require("mongodb");
const verifyInternalRequest = require("../middleware/verifyInternalRequest");

const router = express.Router();

let db;

router.setDatabase = (database) => {
  db = database;
};

function validObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET: Public - সব Studio দেখাবে
router.get("/", async (req, res) => {
  try {
    const { category, search, limit, sort } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { overview: { $regex: search, $options: "i" } },
      ];
    }

    const requestedLimit = Number.parseInt(String(limit || ""), 10);
    const hasLimit = Number.isInteger(requestedLimit) && requestedLimit > 0;
    const safeLimit = hasLimit ? Math.min(requestedLimit, 100) : null;

    const sortOption =
      sort === "rating"
        ? { rating: -1, createdAt: -1 }
        : { createdAt: -1 };

    let query = db.collection("studios").find(filter).sort(sortOption);

    if (safeLimit) {
      query = query.limit(safeLimit);
    }

    const studios = await query.toArray();

    return res.json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    console.error("Failed to fetch studios:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch studios",
    });
  }
});

// GET: Private - শুধু authenticated user's own studios
router.get("/mine", verifyInternalRequest, async (req, res) => {
  try {
    const studios = await db
      .collection("studios")
      .find({ ownerId: req.authenticatedUser.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    console.error("Failed to fetch owner's studios:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your studios",
    });
  }
});

// GET: Public - একটি Studio দেখাবে
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const studio = await db
      .collection("studios")
      .findOne({ _id: new ObjectId(id) });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    return res.json({
      success: true,
      data: studio,
    });
  } catch (error) {
    console.error("Failed to fetch studio:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch studio",
    });
  }
});

// POST: Secure - verified user-এর নামে নতুন Studio তৈরি
router.post("/", verifyInternalRequest, async (req, res) => {
  try {
    req.body =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      image,
      amenities,
      overview,
    } = req.body;

    const user = req.authenticatedUser;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof overview !== "string" ||
      !overview.trim() ||
      !Number.isFinite(Number(hourlyRate)) ||
      Number(hourlyRate) <= 0 ||
      !Number.isFinite(Number(securityDeposit)) ||
      Number(securityDeposit) < 0 ||
      !Number.isInteger(Number(maxCapacity)) ||
      Number(maxCapacity) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid required studio fields",
      });
    }

    const studio = {
      title: title.trim(),
      category: category.trim(),
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit),
      maxCapacity: Number(maxCapacity),
      location: location.trim(),
      image: typeof image === "string" ? image.trim() : "",
      amenities: Array.isArray(amenities)
        ? [...new Set(
            amenities
              .filter((item) => typeof item === "string")
              .map((item) => item.trim())
              .filter(Boolean)
          )]
        : [],
      overview: overview.trim(),

      // Identity comes only from verified server-side authentication
      ownerId: user.id,
      hostName: user.name,
      hostEmail: user.email,

      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("studios").insertOne(studio);

    return res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: {
        ...studio,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Failed to create studio:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create studio",
    });
  }
});

// PUT: Secure - শুধু Studio owner update করতে পারবে
router.put("/:id", verifyInternalRequest, async (req, res) => {
  try {
    req.body =
      req.body &&
      typeof req.body === "object" &&
      !Array.isArray(req.body)
        ? req.body
        : {};
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const allowedFields = [
      "title",
      "category",
      "hourlyRate",
      "securityDeposit",
      "maxCapacity",
      "location",
      "image",
      "amenities",
      "overview",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    for (const field of ["title", "category", "location", "overview"]) {
      if (
        field in updates &&
        (typeof updates[field] !== "string" || !updates[field].trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}`,
        });
      }

      if (field in updates) {
        updates[field] = updates[field].trim();
      }
    }

    if ("hourlyRate" in updates) {
      if (
        !Number.isFinite(Number(updates.hourlyRate)) ||
        Number(updates.hourlyRate) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid hourly rate",
        });
      }

      updates.hourlyRate = Number(updates.hourlyRate);
    }

    if ("securityDeposit" in updates) {
      if (
        !Number.isFinite(Number(updates.securityDeposit)) ||
        Number(updates.securityDeposit) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid security deposit",
        });
      }

      updates.securityDeposit = Number(updates.securityDeposit);
    }

    if ("maxCapacity" in updates) {
      if (
        !Number.isInteger(Number(updates.maxCapacity)) ||
        Number(updates.maxCapacity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid max capacity",
        });
      }

      updates.maxCapacity = Number(updates.maxCapacity);
    }

    if ("amenities" in updates) {
      if (
        !Array.isArray(updates.amenities) ||
        !updates.amenities.every((item) => typeof item === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid amenities",
        });
      }

      updates.amenities = [
        ...new Set(
          updates.amenities
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];
    }

    if ("image" in updates && typeof updates.image !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid image",
      });
    }

    updates.updatedAt = new Date();

    const result = await db.collection("studios").updateOne(
      {
        _id: new ObjectId(id),
        ownerId: req.authenticatedUser.id,
      },
      {
        $set: updates,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Studio not found or you are not its owner",
      });
    }

    return res.json({
      success: true,
      message: "Studio updated successfully",
    });
  } catch (error) {
    console.error("Failed to update studio:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update studio",
    });
  }
});

// DELETE: Secure - শুধু Studio owner delete করতে পারবে
router.delete("/:id", verifyInternalRequest, async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const result = await db.collection("studios").deleteOne({
      _id: new ObjectId(id),
      ownerId: req.authenticatedUser.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Studio not found or you are not its owner",
      });
    }

    return res.json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete studio:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete studio",
    });
  }
});

module.exports = router;




