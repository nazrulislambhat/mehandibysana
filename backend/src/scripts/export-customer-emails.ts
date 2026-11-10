import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  aggregateCustomerEmails,
  writeCustomerEmailExports,
} from "../lib/customer-emails";

export default async function exportCustomerEmails({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("=====================================================");
  logger.info("  EXPORTING CUSTOMER EMAILS FOR CAMPAIGNS            ");
  logger.info("=====================================================");

  const aggregation = await aggregateCustomerEmails(container, {
    includeTest: false,
    segment: "all",
  });

  const paths = writeCustomerEmailExports(aggregation);

  logger.info(`Raw candidates scanned : ${aggregation.totalRawCandidates}`);
  logger.info(`Filtered test/invalid  : ${aggregation.skippedInvalidOrTest}`);
  logger.info(`Clean unique emails    : ${aggregation.totalContacts}`);
  logger.info(`Repeat buyers (2+ ord) : ${aggregation.segmentCounts.repeat_buyers}`);
  logger.info(`Kashmir local (19xxxx) : ${aggregation.segmentCounts.kashmir_local}`);
  logger.info(`Bridal inquiries       : ${aggregation.segmentCounts.bridal_inquiries}`);
  logger.info(`CSV exported to        : ${paths.csvPath}`);
  logger.info(`Plain list exported to : ${paths.txtPath}`);
  logger.info(`Summary JSON exported  : ${paths.summaryPath}`);
  logger.info("=====================================================");
}

