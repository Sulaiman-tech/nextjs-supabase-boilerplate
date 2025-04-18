"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { XMarkIcon } from "@heroicons/react/24/outline";

type SiteFormPopupProps = {
  site?: any;
  onClose: () => void;
  onSave: () => void;
};

export default function SiteFormPopup({
  site,
  onClose,
  onSave,
}: SiteFormPopupProps) {
  const [formData, setFormData] = useState({
    site_name: "",
    official_name: "",
    type: [],
    region: "",
    address: "",
    coordinates: "",
    grid_connection_voltage: "",
    cee: "",
    operator: "",
    dc_capacity_kw: "",
    ac_capacity_kw: "",
    pcs: "",
    pcs_quantity: "",
    module: "",
    module_quantity: "",
    tilt: "",
    rated_power: "",
    nominal_energy_capacity: "",
    operating_capacity: "",
    battery: "",
    battery_containers_qty: "",
    battery_modules_per_rack: "",
    c_rate: "",
    electricity_selling_rate: "",
    cod: "",
  });

  const [aerialFile, setAerialFile] = useState<File | null>(null);
  const [layoutFile, setLayoutFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (site) {
      const mapped = {
        ...site,
        type: site.type
          ? site.type.split(", ").map((s: string) => s.trim())
          : [],
        cod: site.cod ? new Date(site.cod).toISOString().substring(0, 10) : "",
      };
      setFormData(mapped);
    }
  }, [site]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    // Clear the error as the user fixes it
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: checked
          ? [...prev.type, value]
          : prev.type.filter((t) => t !== value),
      }));
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadFile = async (
    file: File,
    bucket: string,
    pathPrefix: string,
    existingPath?: string
  ) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const fullPath = `${pathPrefix}/${fileName}`;

    // Delete old file if it exists
    if (existingPath) {
      await supabase.storage.from(bucket).remove([existingPath]);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    return fullPath;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const newErrors: { [key: string]: string } = {};
    if (!formData.site_name.trim())
      newErrors.site_name = "Site Name is required";
    if (!formData.type.length) newErrors.type = "Select at least one type";
    if (!formData.region) newErrors.region = "Region is required";
    if (!formData.grid_connection_voltage.trim())
      newErrors.grid_connection_voltage = "Grid connection voltage is required";
    if (!formData.operator.trim()) newErrors.operator = "Select an operator";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors({}); // clear errors

    const aerialPath = aerialFile
      ? await uploadFile(
          aerialFile,
          "saferay",
          "sites/site_aerial",
          site?.representative_aerial_url
            ? `sites/site_aerial/${site.representative_aerial_url}`
            : undefined
        )
      : site?.representative_aerial_url;

    const layoutPath = layoutFile
      ? await uploadFile(
          layoutFile,
          "saferay",
          "sites/site_layout",
          site?.representative_layout_url
            ? `sites/site_layout/${site.representative_layout_url}`
            : undefined
        )
      : site?.representative_layout_url;

    const docPath = docFile
      ? await uploadFile(
          docFile,
          "saferay",
          "sites/site_docs",
          site?.site_documentation_url
            ? `sites/site_docs/${site.site_documentation_url}`
            : undefined
        )
      : site?.site_documentation_url;

    const payload = {
      ...formData,
      type: formData.type.join(", "),
      pcs_quantity: parseInt(formData.pcs_quantity) || null,
      module_quantity: parseInt(formData.module_quantity) || null,
      battery_containers_qty: parseInt(formData.battery_containers_qty) || null,
      battery_modules_per_rack:
        parseInt(formData.battery_modules_per_rack) || null,
      dc_capacity_kw: parseFloat(formData.dc_capacity_kw) || null,
      ac_capacity_kw: parseFloat(formData.ac_capacity_kw) || null,
      cod: formData.cod || null,
      representative_aerial_url: aerialPath?.split("/").pop(),
      representative_layout_url: layoutPath?.split("/").pop(),
      site_documentation_url: docPath?.split("/").pop(),
    };

    let result;
    if (site?.id) {
      result = await supabase.from("sites").update(payload).eq("id", site.id);
    } else {
      result = await supabase.from("sites").insert(payload);
    }

    setLoading(false);

    const { error } = result;
    if (error) {
      alert("Error saving site: " + error.message);
    } else {
      onSave();
      onClose();
    }
  };

  const isPV = formData.type.includes("PV");
  const isBESS = formData.type.includes("BESS");

  return (
    <div
      className={`fixed right-0  bottom-0 left-0 z-50 bg-black/40 flex justify-end items-start sm:p-4 md:p-0 ${
        site ? "top-0" : "-top-8"
      }`}
    >
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-4xl sm:w-[48rem] h-full overflow-y-auto p-6 space-y-4 relative overflow-x-hidden">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0096a2] dark:text-white">
            {site ? "Edit Site" : "Add New Site"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <input
              name="site_name"
              value={formData.site_name}
              placeholder="Site Name *"
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900${
                errors.site_name ? "border-red-500" : ""
              }`}
            />
            <span className="text-xs text-red-600 min-h-[1.25rem] block mt-1">
              {errors.site_name || " "}
            </span>
          </div>
          <div className="flex flex-col">
            <input
              name="official_name"
              value={formData.official_name}
              placeholder="Official Name"
              onChange={handleChange}
              className="border p-2 rounded text-sm dark:bg-gray-900"
            />
            <span className="text-xs text-red-600 min-h-[1.25rem] block mt-1">
              {errors.official_name || " "}
            </span>
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex gap-6 items-center">
              <label className="inline-flex dark:text-white items-center gap-2 text-sm text-gray-800 text-sm">
                <input
                  type="checkbox"
                  name="type"
                  value="PV"
                  checked={formData.type.includes("PV")}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#0096a2] text-sm"
                />
                PV
              </label>

              <label className="inline-flex items-center dark:text-white gap-2 text-sm text-gray-800 text-sm">
                <input
                  type="checkbox"
                  name="type"
                  value="BESS"
                  checked={formData.type.includes("BESS")}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#0096a2] text-sm"
                />
                BESS
              </label>
            </div>
            {errors.type && (
              <p className="text-xs text-red-600 min-h-[1.25rem] block mt-1">
                {errors.type}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={`border p-2 rounded text-sm dark:bg-gray-900 ${
                errors.region ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Region</option>
              {[
                "Hokkaido",
                "Tohoku",
                "Kanto",
                "Chubu",
                "Kinki",
                "Chugoku",
                "Shikoku",
                "Kyushu",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <span className="text-xs text-red-600 min-h-[1.25rem] block mt-1">
              {errors.region || " "}
            </span>
          </div>

          <input
            name="address"
            value={formData.address}
            placeholder="Address"
            onChange={handleChange}
            className="border p-2 rounded mb-4 text-sm dark:bg-gray-900"
          />

          <input
            name="coordinates"
            value={formData.coordinates}
            placeholder="Coordinates"
            onChange={handleChange}
            className="border p-2 rounded mb-4 text-sm dark:bg-gray-900"
          />

          <input
            name="cee"
            value={formData.cee}
            placeholder="CEE"
            onChange={handleChange}
            className="border p-2 rounded w-full mb-4 text-sm dark:bg-gray-900"
          />
          <div className="flex flex-col mt-2">
            <div className="flex gap-4">
              <p className="text-sm">Grid Connection Voltage:</p>
              <label className="text-sm dark:text-white">
                <input
                  type="radio"
                  name="grid_connection_voltage"
                  value="HV"
                  className="accent-[#0096a2]"
                  checked={formData.grid_connection_voltage === "HV"}
                  onChange={handleChange}
                />{" "}
                HV
              </label>
              <label className="text-sm dark:text-white">
                <input
                  type="radio"
                  name="grid_connection_voltage"
                  value="EHV"
                  className="accent-[#0096a2]"
                  checked={formData.grid_connection_voltage === "EHV"}
                  onChange={handleChange}
                />{" "}
                EHV
              </label>
            </div>
            {errors.grid_connection_voltage && (
              <p className="text-xs text-red-600 min-h-[1.25rem] block mt-1">
                {errors.grid_connection_voltage}
              </p>
            )}
          </div>
          <div className="flex gap-4 mb-4">
            <p className="text-sm">Operator:</p>
            <label className="text-sm">
              <input
                type="radio"
                name="operator"
                value="SRO"
                className="accent-[#0096a2]"
                checked={formData.operator === "SRO"}
                onChange={handleChange}
              />{" "}
              SRO
            </label>
            <label className="text-sm">
              <input
                type="radio"
                name="operator"
                value="SRS"
                className="accent-[#0096a2]"
                checked={formData.operator === "SRS"}
                onChange={handleChange}
              />{" "}
              SRS
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <label className="block mb-4 text-sm">
            Aerial Photo:{" "}
            <input
              type="file"
              onChange={(e) => setAerialFile(e.target.files?.[0] || null)}
            />
          </label>
          <label className="block mb-4 text-sm">
            Layout Image:{" "}
            <input
              type="file"
              onChange={(e) => setLayoutFile(e.target.files?.[0] || null)}
            />
          </label>
          <label className="block mb-4 text-sm">
            Site Document:{" "}
            <input
              type="file"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {isPV && (
          <div>
            <h3 className="text-lg font-semibold text-[#0096a2] mb-2 mt-6">
              PV Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="dc_capacity_kw"
                value={formData.dc_capacity_kw}
                placeholder="DC Capacity (kW)"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="ac_capacity_kw"
                value={formData.ac_capacity_kw}
                placeholder="AC Capacity (kW)"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="pcs"
                value={formData.pcs}
                placeholder="PCS"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="pcs_quantity"
                value={formData.pcs_quantity}
                placeholder="PCS Quantity"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="module"
                value={formData.module}
                placeholder="Module"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="module_quantity"
                value={formData.module_quantity}
                placeholder="Module Quantity"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="tilt"
                value={formData.tilt}
                placeholder="Tilt"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
            </div>
          </div>
        )}

        {isBESS && (
          <div>
            <h3 className="text-lg font-semibold text-[#0096a2] mb-2 mt-6">
              BESS Fields
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="rated_power"
                value={formData.rated_power}
                placeholder="Rated Power"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="nominal_energy_capacity"
                value={formData.nominal_energy_capacity}
                placeholder="Nominal Energy Capacity"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="operating_capacity"
                value={formData.operating_capacity}
                placeholder="Operating Capacity"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="battery"
                value={formData.battery}
                placeholder="Battery"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="battery_containers_qty"
                value={formData.battery_containers_qty}
                placeholder="Battery Containers Qty"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="battery_modules_per_rack"
                value={formData.battery_modules_per_rack}
                placeholder="Battery Modules per Rack"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
              <input
                name="c_rate"
                value={formData.c_rate}
                placeholder="C-Rate"
                onChange={handleChange}
                className="border p-2 rounded text-sm dark:bg-gray-900"
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="electricity_selling_rate"
            value={formData.electricity_selling_rate}
            placeholder="Electricity Selling Rate"
            onChange={handleChange}
            className="border p-2 rounded text-sm dark:bg-gray-900"
          />
          <input
            name="cod"
            value={formData.cod}
            type="date"
            placeholder="COD"
            onChange={handleChange}
            className="border p-2 rounded text-sm dark:bg-gray-900"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-[#0096a2] text-white px-6 py-2 rounded shadow w-full mt-8"
          >
            Save Site
          </button>
        </div>
        {loading && <LoadingOverlay />}
      </div>
    </div>
  );
}

// ✅ Blue spinning loading animation
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 bg-white/70 dark:bg-black/60 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0097a2] border-t-transparent"></div>
    </div>
  );
}
