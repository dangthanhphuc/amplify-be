import { defineFunction } from "@aws-amplify/backend";

export const deleteReportCategoryFnc = defineFunction({
    name: "deleteReportCategoryFnc",
        timeoutSeconds: 30,
})