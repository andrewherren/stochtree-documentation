---
title: predict.bartmodel
---

# Predict from a sampled BART model on new data

## Description

Predict from a sampled BART model on new data

## Usage

```r
# S3 method for bartmodel
predict(
  bart,
  X_test,
  W_test = NULL,
  group_ids_test = NULL,
  rfx_basis_test = NULL
)
```

## Arguments

* `bart`: Object of type `bart` containing draws of a regression forest and associated sampling outputs.
* `X_test`: Covariates used to determine tree leaf predictions for each observation. Must be passed as a matrix or dataframe.
* `W_test`: (Optional) Bases used for prediction (by e.g. dot product with leaf values). Default: `NULL`.
* `group_ids_test`: (Optional) Test set group labels used for an additive random effects model.
We do not currently support (but plan to in the near future), test set evaluation for group labels
that were not in the training set.
* `rfx_basis_test`: (Optional) Test set basis for "random-slope" regression in additive random effects model.

## Value

List of prediction matrices. If model does not have random effects, the list has one element -- the predictions from the forest.
If the model does have random effects, the list has three elements -- forest predictions, random effects predictions, and their sum (`y_hat`).

## Examples

```r
n \<- 100
p \<- 5
X \<- matrix(runif(n*p), ncol = p)
f_XW \<- (
```r
((0 \<= X[,1]) & (0.25 \> X[,1])) * (-7.5) + 
((0.25 \<= X[,1]) & (0.5 \> X[,1])) * (-2.5) + 
((0.5 \<= X[,1]) & (0.75 \> X[,1])) * (2.5) + 
((0.75 \<= X[,1]) & (1 \> X[,1])) * (7.5)
```
)
noise_sd \<- 1
y \<- f_XW + rnorm(n, 0, noise_sd)
test_set_pct \<- 0.2
n_test \<- round(test_set_pct*n)
n_train \<- n - n_test
test_inds \<- sort(sample(1:n, n_test, replace = FALSE))
train_inds \<- (1:n)[!((1:n) %in% test_inds)]
X_test \<- X[test_inds,]
X_train \<- X[train_inds,]
y_test \<- y[test_inds]
y_train \<- y[train_inds]
bart_model \<- bart(X_train = X_train, y_train = y_train)
y_hat_test \<- predict(bart_model, X_test)
# plot(rowMeans(y_hat_test), y_test, xlab = "predicted", ylab = "actual")
# abline(0,1,col="red",lty=3,lwd=3)
```
