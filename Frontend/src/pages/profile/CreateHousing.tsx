import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { createHousing } from "@/store/features/housing/housingSlice";
import type { AppDispatch, RootState } from "@/store";
import { useNavigate } from "react-router";

type FormData = CreateHousingBody;

const CreateHousing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector(
    (state: RootState) => state.housingList
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      availableDates: [{ start: "", end: "" }],
      maxAdults: 0,
      maxKids: 0,
      maxAnimals: 0,
      prices: { adult: 0, kid: 0, animal: 0, housing: 0 },
      type: "",
      place: "",
      nearActivities: {
        description: "",
        activities: [{ name: "", location: "" }],
      },
      petFriendly: false,
      images: [""],
      rules: [""],
      bedrooms: 0,
      rooms: 0,
      beds: 0,
    },
  });

  const {
    fields: dateFields,
    append: appendDate,
    remove: removeDate,
  } = useFieldArray({
    control,
    name: "availableDates",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "images" as any,
  });

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    name: "rules" as any,
  });

  const {
    fields: activityFields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: "nearActivities.activities",
  });

  const onSubmit = (data: FormData) => {
    const transformedData: CreateHousingBody = {
      ...data,
      maxAdults: Number(data.maxAdults),
      maxKids: Number(data.maxKids),
      maxAnimals: Number(data.maxAnimals),
      bedrooms: Number(data.bedrooms),
      rooms: Number(data.rooms),
      beds: Number(data.beds),
      prices: {
        adult: Number(data.prices.adult),
        kid: Number(data.prices.kid),
        animal: Number(data.prices.animal),
        housing: Number(data.prices.housing),
      },
    };
    console.log("Form Data:", transformedData);
    dispatch(createHousing(transformedData)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/"); // Redirect on success
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Skapa nytt bostad
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Grundläggnade Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Musig stuga"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plats</label>
              <input
                {...register("location", { required: "Location is required" })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Stockholm, Sverige"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Beskrivning
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
                placeholder="Beskriv ditt boende..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Capacity Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Kapacitet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Vuxna
              </label>
              <input
                type="number"
                {...register("maxAdults", { required: "Required", min: 1 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.maxAdults && (
                <p className="text-red-500 text-sm">
                  {errors.maxAdults.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Barn</label>
              <input
                type="number"
                {...register("maxKids", { required: "Required", min: 0 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.maxKids && (
                <p className="text-red-500 text-sm">{errors.maxKids.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Hundar
              </label>
              <input
                type="number"
                {...register("maxAnimals", { required: "Required", min: 0 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.maxAnimals && (
                <p className="text-red-500 text-sm">
                  {errors.maxAnimals.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Husdjursvänligt
              </label>
              <input
                type="checkbox"
                {...register("petFriendly")}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Rum</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sovrum</label>
              <input
                type="number"
                {...register("bedrooms", { required: "Required", min: 1 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.bedrooms && (
                <p className="text-red-500 text-sm">
                  {errors.bedrooms.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rum</label>
              <input
                type="number"
                {...register("rooms", { required: "Required", min: 1 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.rooms && (
                <p className="text-red-500 text-sm">{errors.rooms.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sängar</label>
              <input
                type="number"
                {...register("beds", { required: "Required", min: 1 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.beds && (
                <p className="text-red-500 text-sm">{errors.beds.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Prices Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Priser (per natt)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vuxen</label>
              <input
                type="number"
                {...register("prices.adult", { required: "Required", min: 0 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.prices?.adult && (
                <p className="text-red-500 text-sm">
                  {errors.prices.adult.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barn</label>
              <input
                type="number"
                {...register("prices.kid", { required: "Required", min: 0 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.prices?.kid && (
                <p className="text-red-500 text-sm">
                  {errors.prices.kid.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hund</label>
              <input
                type="number"
                {...register("prices.animal", { required: "Required", min: 0 })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.prices?.animal && (
                <p className="text-red-500 text-sm">
                  {errors.prices.animal.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Boende</label>
              <input
                type="number"
                {...register("prices.housing", {
                  required: "Required",
                  min: 0,
                })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.prices?.housing && (
                <p className="text-red-500 text-sm">
                  {errors.prices.housing.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Type and Place */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Typ & Ställe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Typ</label>
              <input
                {...register("type", { required: "Type is required" })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Stuga"
              />
              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ställe</label>
              <input
                {...register("place", { required: "Place is required" })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Skog"
              />
              {errors.place && (
                <p className="text-red-500 text-sm">{errors.place.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Available Dates */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tillgängliga Datum</h2>
          {dateFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center"
            >
              <input
                type="date"
                {...register(`availableDates.${index}.start` as const, {
                  required: "Start date required",
                })}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                {...register(`availableDates.${index}.end` as const, {
                  required: "End date required",
                })}
                className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={() => removeDate(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Ta bort
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendDate({ start: "", end: "" })}
            className="w-full sm:w-auto mt-2 bg-green-500 hover:bg-green-600 text-white"
          >
            Lägg till datumintervall
          </Button>
        </div>

        {/* Images */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Bilder (URLs)</h2>
          {imageFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center"
            >
              <input
                {...register(`images.${index}` as const, {
                  required: "Image URL required",
                })}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://example.com/image.jpg"
              />
              <Button
                type="button"
                onClick={() => removeImage(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Ta bort
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendImage("")}
            className="w-full sm:w-auto mt-2 bg-green-500 hover:bg-green-600 text-white"
          >
            Lägg till bild
          </Button>
        </div>

        {/* Rules */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Regler</h2>
          {ruleFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center"
            >
              <input
                {...register(`rules.${index}` as const, {
                  required: "Rule required",
                })}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Ingen rökning inomhus"
              />
              <Button
                type="button"
                onClick={() => removeRule(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Ta bort
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendRule("")}
            className="w-full sm:w-auto mt-2 bg-green-500 hover:bg-green-600 text-white"
          >
            Lägg till regler
          </Button>
        </div>

        {/* Near Activities */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Nära Aktiviteter</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Beskrivning
            </label>
            <textarea
              {...register("nearActivities.description", {
                required: "Description required",
              })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 resize-y"
              rows={2}
              placeholder="Beskriv nära aktiviteter..."
            />
            {errors.nearActivities?.description && (
              <p className="text-red-500 text-sm">
                {errors.nearActivities.description.message}
              </p>
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">Aktiviteter </h3>
          {activityFields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center"
            >
              <input
                {...register(
                  `nearActivities.activities.${index}.name` as const,
                  { required: "Name required" }
                )}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Aktivitet namn"
              />
              <input
                {...register(
                  `nearActivities.activities.${index}.location` as const,
                  { required: "Location required" }
                )}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Aktivitet plats"
              />
              <Button
                type="button"
                onClick={() => removeActivity(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Ta bort
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendActivity({ name: "", location: "" })}
            className="w-full sm:w-auto mt-2 bg-green-500 hover:bg-green-600 text-white"
          >
            Lägg till Aktivitet
          </Button>
        </div>

        {/* Error Display */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Skapar..." : "Skapa Bostad"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHousing;
