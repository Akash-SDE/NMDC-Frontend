import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROUTE_BY_ROLE,
  RAILWAY_DEPARTMENT_BY_ROLE,
  RAILWAY_ROLES,
  USER_ROLES,
  isReadOnlyRole,
  resolveRoleFromProfile,
} from "../constants/roles";
import { getSidebarSections } from "../data/navigation";

const profileWithRole = (role_name) => ({ is_superuser: false, role: [{ role_name }] });

describe("railway role access", () => {
  it.each([
    ["Railway Operation", USER_ROLES.STATION_MASTER, "operations"],
    ["Railway Commercial", USER_ROLES.COMMERCIAL, "commercial"],
    ["Railway CNW", USER_ROLES.CW_INSPECTOR, "cw"],
  ])("maps %s to its own approval department", (roleName, role, department) => {
    const resolved = resolveRoleFromProfile(profileWithRole(roleName));
    expect(resolved).toBe(role);
    expect(RAILWAY_DEPARTMENT_BY_ROLE[resolved]).toBe(department);
    expect(DEFAULT_ROUTE_BY_ROLE[resolved]).toContain(`dept=${department}`);
  });

  it("makes railway roles read-only and hides master data and reports from their sidebar", () => {
    const sidebarIds = (role) => getSidebarSections(role).flatMap((section) => section.items.map((item) => item.id));
    for (const role of RAILWAY_ROLES) {
      expect(isReadOnlyRole(role)).toBe(true);
      expect(sidebarIds(role)).not.toContain("master-data");
      expect(sidebarIds(role)).not.toContain("reports");
      expect(sidebarIds(role)).toContain("loading-management");
    }
    expect(isReadOnlyRole(USER_ROLES.ADMIN)).toBe(false);
    expect(sidebarIds(USER_ROLES.ADMIN)).toContain("master-data");
  });

  it("gives superusers and admins unrestricted approval access", () => {
    expect(resolveRoleFromProfile({ is_superuser: true, role: [] })).toBe(USER_ROLES.SUPERADMIN);
    expect(resolveRoleFromProfile(profileWithRole("Admin"))).toBe(USER_ROLES.ADMIN);
    expect(RAILWAY_DEPARTMENT_BY_ROLE[USER_ROLES.SUPERADMIN]).toBeUndefined();
    expect(RAILWAY_DEPARTMENT_BY_ROLE[USER_ROLES.ADMIN]).toBeUndefined();
  });
});
