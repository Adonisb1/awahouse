import { router, listingCreatorProcedure, authedProcedure, publicProcedure } from '../trpc';
import {
  createPropertyInput,
  updatePropertyInput,
  propertySearchInput,
  propertyIdInput,
  uploadImagesInput,
  savePropertyInput,
} from '../schemas/properties';
import { propertyService } from '../services/PropertyService';

export const propertiesRouter = router({
  create: listingCreatorProcedure
    .input(createPropertyInput)
    .mutation(async ({ input, ctx }) => {
      const property = await propertyService.create(ctx.userId!, input);
      return { success: true, id: property.id };
    }),

  update: listingCreatorProcedure
    .input(propertyIdInput.merge(updatePropertyInput))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await propertyService.update(ctx.userId!, id, data);
      return { success: true };
    }),

  delete: listingCreatorProcedure
    .input(propertyIdInput)
    .mutation(async ({ input, ctx }) => {
      return propertyService.delete(ctx.userId!, input.id);
    }),

  getById: publicProcedure
    .input(propertyIdInput)
    .query(async ({ input }) => {
      return propertyService.getById(input.id);
    }),

  search: publicProcedure
    .input(propertySearchInput)
    .query(async ({ input }) => {
      return propertyService.search(input);
    }),

  listMyProperties: authedProcedure
    .query(async ({ ctx }) => {
      return propertyService.listMyProperties(ctx.userId!);
    }),

  uploadImages: listingCreatorProcedure
    .input(uploadImagesInput)
    .mutation(async ({ input, ctx }) => {
      return propertyService.uploadImages(ctx.userId!, input.propertyId, input.images);
    }),

  saveProperty: authedProcedure
    .input(savePropertyInput)
    .mutation(async ({ input, ctx }) => {
      return propertyService.saveProperty(ctx.userId!, input.propertyId, input.save);
    }),

  getSavedProperties: authedProcedure
    .query(async ({ ctx }) => {
      return propertyService.getSavedProperties(ctx.userId!);
    }),
});
