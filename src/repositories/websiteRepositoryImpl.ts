import { inject, injectable } from "inversify";
import { Database } from "sqlite3";
import { Website } from "../models/website";
import { TYPES } from "../types";
import { WebsiteRepository } from "./websiteRepository";

@injectable()
export class WebsiteRepositoryImpl implements WebsiteRepository {
  constructor(@inject(TYPES.Database) private database: Database) {}

  add(website: Website): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const statement = this.database.prepare(
        "INSERT INTO Website VALUES(?, ?, ?)"
      );
      statement.run([website.url, website.title, website.description], err => {
        if (err) {
          reject(err);
        }
        statement.finalize();
        resolve();
      });
    });
  }

  search(value: string): Promise<Website[]> {
    return new Promise<Website[]>((resolve, reject) => {
      const websites: Website[] = [];
      this.database.all(
        "SELECT url, title, description FROM Website WHERE title LIKE (?) OR description LIKE (?)",
        [`%${value}%`, `%${value}%`],
        (err, rows) => {
          if (err) {
            reject(err);
          }

          rows.forEach(row => {
            websites.push({
              description: row.description,
              title: row.title,
              url: row.url
            });
          });

          this.database.close(closeErr => {
            if (closeErr) {
              reject(closeErr);
            }
            resolve(websites);
          });
        }
      );
    });
  }
}
