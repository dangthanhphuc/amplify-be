import { defineFunction } from "@aws-amplify/backend";

export const updateReportCategoryFnc = defineFunction({
    name: "updateReportCategoryFnc",
    timeoutSeconds: 30,
})