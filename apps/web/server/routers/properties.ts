import { router, listingCreatorProcedure, authedProcedure, publicProcedure } from '../trpc';
import { createPropertyInput, updatePropertyInput, propertySearchInput, propertyIdInput, uploadImagesInput, savePropertyInput } from '../schemas/properties';

export const propertiesRouter = router({
  create: listingCreatorProcedure
    .input(createPropertyInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true, id: '' };
    }),

  update: listingCreatorProcedure
    .input(updatePropertyInput.merge(propertyIdInput))
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),

  delete: listingCreatorProcedure
    .input(propertyIdInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),

  getById: publicProcedure
    .input(propertyIdInput)
    .query(async ({ input }) => {
      return null;
    }),

  search: publicProcedure
    .input(propertySearchInput)
    .query(async ({ input }) => {
      return { properties: [], total: 0 };
    }),

  listMyProperties: authedProcedure
    .query(async ({ ctx }) => {
      return { properties: [] };
    }),

  uploadImages: listingCreatorProcedure
    .input(uploadImagesInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true, images: [] as Array<{ id: string; url: string }> };
    }),

  saveProperty: authedProcedure
    .input(savePropertyInput)
    .mutation(async ({ input, ctx }) => {
      return { success: true };
    }),

  getSavedProperties: authedProcedure
    .query(async ({ ctx }) => {
      return { properties: [] };
    }),
});
