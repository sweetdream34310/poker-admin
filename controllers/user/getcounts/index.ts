import { Request, Response } from "express";
import { GetTournamentListRes } from "../../../interfaces/tournament";

const cosmos = require("../../../utils/cosmos");

export const getCounts = async (
  req: Request,
  res: Response<GetTournamentListRes>
) => {
  const pageNum = parseInt(req.body.pageNum as string) || 1;
  const rowsPerPage = parseInt(req.body.rowsPerPage as string) || 10;

  const skip = (pageNum - 1) * rowsPerPage;

  try {
    const container = await cosmos.getContainer("tournament");

    // Query tournaments with pagination
    const { resources: tournaments, headers } = await container.items
      .query({
        query: "SELECT * FROM c OFFSET @skip LIMIT @limit",
        parameters: [
          { name: "@skip", value: skip },
          { name: "@limit", value: rowsPerPage },
        ],
      })
      .fetchAll();

    // Get total number of tournaments
    const totalCount = headers["x-ms-item-count"];

    res.status(200).json({
      message: "Tournaments retrieved successfully",
      data: tournaments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving tournaments",
      data: [],
    });
  }
};
