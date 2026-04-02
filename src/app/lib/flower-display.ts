/** Border + fill classes for the health bar; thresholds align with `imageForHealth`. */
export function healthBarColorClasses(health: number): {
  trackBorder: string;
  fill: string;
} {
  if (health < 50) {
    return { trackBorder: "border-health-bar-low", fill: "bg-health-bar-low" };
  }
  if (health < 70) {
    return { trackBorder: "border-health-bar-warn", fill: "bg-health-bar-warn" };
  }
  return { trackBorder: "border-health-bar-sage", fill: "bg-health-bar-sage" };
}

/**
 * Images follow the convention: `*_0.png` (healthy), `*_1.png` (sick), `*_2.png` (joever).
 * If that convention does not apply, we fall back to the healthy image.
 */
export function imageForHealth(healthyImage: string, health: number): string {
  const sickImage = healthyImage.replace(/_0\.png$/, "_1.png");
  const joeverImage = healthyImage.replace(/_0\.png$/, "_2.png");
  if (health < 50 && joeverImage !== healthyImage) return joeverImage;
  if (health < 70 && sickImage !== healthyImage) return sickImage;
  return healthyImage;
}
